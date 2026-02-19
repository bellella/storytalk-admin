"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, Loader2 } from "lucide-react";
import type { SceneBasic, DialogueBasic } from "@/types";

interface ImportExportDialogsProps {
  storyId: number;
  episodeId: number;
  episodeOrder: number;
  scenes: SceneBasic[];
  isImportOpen: boolean;
  isExportOpen: boolean;
  onImportOpenChange: (open: boolean) => void;
  onExportOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportExportDialogs({
  storyId,
  episodeId,
  episodeOrder,
  scenes,
  isImportOpen,
  isExportOpen,
  onImportOpenChange,
  onExportOpenChange,
  onImportComplete,
}: ImportExportDialogsProps) {
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportJson, setExportJson] = useState("");

  const handleImport = async () => {
    if (!importJson.trim()) {
      setImportError("JSON을 입력해주세요");
      return;
    }

    try {
      setImporting(true);
      setImportError(null);

      const importData = JSON.parse(importJson);

      if (
        !importData.scenes &&
        !importData.reviewItems &&
        !importData.quizzes
      ) {
        throw new Error(
          "Invalid JSON structure. At least one of scenes, reviewItems, or quizzes is required."
        );
      }

      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(importData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      onImportOpenChange(false);
      setImportJson("");
      setImportError(null);
      onImportComplete();
    } catch (e: unknown) {
      setImportError(
        e instanceof Error ? e.message : "Import failed"
      );
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const scenesWithDialogues = await Promise.all(
        scenes.map(async (scene) => {
          const res = await fetch(
            `/api/stories/${storyId}/episodes/${episodeId}/scenes/${scene.id}/dialogues`
          );
          const dialogues = res.ok ? await res.json() : [];
          return {
            type: scene.type || "VISUAL",
            title: scene.title,
            koreanTitle: scene.koreanTitle,
            order: scene.order,
            dialogues: dialogues.map((d: DialogueBasic) => ({
              order: d.order,
              type: d.type,
              characterName: d.characterName || "",
              charImageLabel: d.charImageLabel,
              englishText: d.englishText,
              koreanText: d.koreanText,
              imageUrl: d.imageUrl,
              ...(d.aiPromptName != null && { aiPromptName: d.aiPromptName }),
              data: d.data ?? null,
            })),
          };
        })
      );

      const reviewRes = await fetch(
        `/api/episodes/${episodeId}/review-items`
      );
      const reviewItemsData = reviewRes.ok ? await reviewRes.json() : [];

      const exportReviewItems = reviewItemsData
        .map(
          (item: { sceneOrder?: number; dialogueOrder?: number; description: string | null }) => ({
            sceneOrder: item.sceneOrder || 0,
            dialogueOrder: item.dialogueOrder || 0,
            description: item.description,
          })
        )
        .filter((r: { sceneOrder: number }) => r.sceneOrder > 0);

      const quizRes = await fetch(`/api/episodes/${episodeId}/quizzes`);
      const quizResData = quizRes.ok ? await quizRes.json() : {};
      const quizzesArray = Array.isArray(quizResData)
        ? quizResData
        : (quizResData.quizzes ?? []);

      const exportQuizzes = quizzesArray.map(
        (quiz: {
          type: string;
          questionEnglish: string;
          questionKorean: string | null;
          description: string | null;
          data: unknown;
        }) => ({
          type: quiz.type,
          questionEnglish: quiz.questionEnglish,
          questionKorean: quiz.questionKorean,
          description: quiz.description,
          data: quiz.data,
        })
      );

      const exportData: Record<string, unknown> = {
        scenes: scenesWithDialogues,
      };

      if (exportReviewItems.length > 0) {
        exportData.reviewItems = exportReviewItems;
      }
      if (exportQuizzes.length > 0) {
        exportData.quizzes = exportQuizzes;
      }

      setExportJson(JSON.stringify(exportData, null, 2));
      onExportOpenChange(true);
    } catch (e: unknown) {
      console.error("Export failed:", e);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `episode-${episodeOrder || episodeId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Export Button */}
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={handleExport}
      >
        <Download className="w-4 h-4 mr-2" />
        Export JSON
      </Button>

      {/* Import Button */}
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => {
          setImportJson("");
          setImportError(null);
          onImportOpenChange(true);
        }}
      >
        <Upload className="w-4 h-4 mr-2" />
        Import JSON
      </Button>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={onExportOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Export Episode Data</DialogTitle>
            <DialogDescription>
              현재 에피소드의 scenes와 dialogues를 JSON으로 내보냅니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              <Label>JSON Data</Label>
              <Textarea
                value={exportJson}
                readOnly
                className="font-mono text-sm min-h-[400px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onExportOpenChange(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => navigator.clipboard.writeText(exportJson)}
              variant="outline"
              className="rounded-xl"
            >
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownloadJson} className="rounded-xl">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={onImportOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Episode Data</DialogTitle>
            <DialogDescription>
              JSON 형식의 episode 데이터를 붙여넣어주세요. scenes,
              reviewItems, quizzes 중 제공된 항목만 다시 생성됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              <Label>JSON Data</Label>
              <Textarea
                value={importJson}
                onChange={(e) => {
                  setImportJson(e.target.value);
                  setImportError(null);
                }}
                placeholder='{"scenes": [{"title": "Scene 1", "order": 1, "dialogues": [...]}]}'
                className="font-mono text-sm min-h-[400px]"
              />
              {importError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {importError}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onImportOpenChange(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !importJson.trim()}
              className="rounded-xl"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
