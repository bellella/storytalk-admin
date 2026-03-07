"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, Loader2, Layers, CheckSquare, Square } from "lucide-react";
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

type ParsedScene = {
  title: string;
  koreanTitle?: string;
  dialogues: unknown[];
};

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

  // 씬별 import 상태
  const [isSceneImportOpen, setIsSceneImportOpen] = useState(false);
  const [sceneImportJson, setSceneImportJson] = useState("");
  const [sceneImportError, setSceneImportError] = useState<string | null>(null);
  const [parsedScenes, setParsedScenes] = useState<ParsedScene[] | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [appendMode, setAppendMode] = useState(true);
  const [sceneImporting, setSceneImporting] = useState(false);

  // ── 전체 Import ──────────────────────────────────────────

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
      setImportError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ── 씬별 Import ──────────────────────────────────────────

  const handleParseScenes = () => {
    setSceneImportError(null);
    setParsedScenes(null);
    setSelectedIndices(new Set());

    if (!sceneImportJson.trim()) {
      setSceneImportError("JSON을 입력해주세요");
      return;
    }

    try {
      const data = JSON.parse(sceneImportJson);
      if (!data.scenes || !Array.isArray(data.scenes) || data.scenes.length === 0) {
        throw new Error("scenes 배열이 없거나 비어있습니다.");
      }
      const parsed: ParsedScene[] = data.scenes.map((s: any) => ({
        title: s.title ?? "(제목 없음)",
        koreanTitle: s.koreanTitle,
        dialogues: Array.isArray(s.dialogues) ? s.dialogues : [],
      }));
      setParsedScenes(parsed);
      // 기본으로 전체 선택
      setSelectedIndices(new Set(parsed.map((_, i) => i)));
    } catch (e: unknown) {
      setSceneImportError(e instanceof Error ? e.message : "JSON 파싱 실패");
    }
  };

  const toggleScene = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (!parsedScenes) return;
    if (selectedIndices.size === parsedScenes.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(parsedScenes.map((_, i) => i)));
    }
  };

  const handleSceneImport = async () => {
    if (!parsedScenes || selectedIndices.size === 0) return;

    try {
      setSceneImporting(true);
      setSceneImportError(null);

      const data = JSON.parse(sceneImportJson);
      const payload = {
        scenes: data.scenes,
        sceneIndices: Array.from(selectedIndices).sort((a, b) => a - b),
        appendMode,
      };

      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      setIsSceneImportOpen(false);
      setSceneImportJson("");
      setParsedScenes(null);
      setSelectedIndices(new Set());
      onImportComplete();
    } catch (e: unknown) {
      setSceneImportError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setSceneImporting(false);
    }
  };

  const handleSceneImportClose = (open: boolean) => {
    setIsSceneImportOpen(open);
    if (!open) {
      setSceneImportJson("");
      setParsedScenes(null);
      setSelectedIndices(new Set());
      setSceneImportError(null);
      setAppendMode(true);
    }
  };

  // ── Export ───────────────────────────────────────────────

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
            flowType: scene.flowType ?? "NORMAL",
            title: scene.title,
            koreanTitle: scene.koreanTitle,
            bgImageUrl: scene.bgImageUrl ?? null,
            data: scene.data ?? null,
            order: scene.order,
            dialogues: dialogues.map((d: DialogueBasic) => ({
              order: d.order,
              type: d.type,
              speakerRole: d.speakerRole ?? "SYSTEM",
              characterName: d.characterName || "",
              charImageLabel: d.charImageLabel,
              englishText: d.englishText,
              koreanText: d.koreanText,
              imageUrl: d.imageUrl,
              audioUrl: d.audioUrl,
              ...(d.aiPromptName != null && { aiPromptName: d.aiPromptName }),
              data: d.data ?? null,
            })),
          };
        })
      );

      const reviewRes = await fetch(`/api/episodes/${episodeId}/review-items`);
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

      const exportData: Record<string, unknown> = { scenes: scenesWithDialogues };
      if (exportReviewItems.length > 0) exportData.reviewItems = exportReviewItems;
      if (exportQuizzes.length > 0) exportData.quizzes = exportQuizzes;

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

  const allSelected = parsedScenes !== null && selectedIndices.size === parsedScenes.length;

  return (
    <>
      {/* Export Button */}
      <Button variant="outline" className="rounded-xl" onClick={handleExport}>
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

      {/* 씬별 Import Button */}
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => setIsSceneImportOpen(true)}
      >
        <Layers className="w-4 h-4 mr-2" />
        씬별 Import
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
            <Button variant="outline" onClick={() => onExportOpenChange(false)}>
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

      {/* Import Dialog (전체) */}
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

      {/* 씬별 Import Dialog */}
      <Dialog open={isSceneImportOpen} onOpenChange={handleSceneImportClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>씬별 Import</DialogTitle>
            <DialogDescription>
              JSON에서 원하는 씬만 선택해서 가져올 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4 pr-1">
            {/* JSON 입력 */}
            <div className="space-y-2">
              <Label>JSON Data</Label>
              <Textarea
                value={sceneImportJson}
                onChange={(e) => {
                  setSceneImportJson(e.target.value);
                  setSceneImportError(null);
                  setParsedScenes(null);
                  setSelectedIndices(new Set());
                }}
                placeholder='{"scenes": [...]}'
                className="font-mono text-sm min-h-[140px]"
              />
              <Button
                variant="secondary"
                className="w-full rounded-xl"
                onClick={handleParseScenes}
                disabled={!sceneImportJson.trim()}
              >
                씬 목록 파싱
              </Button>
              {sceneImportError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {sceneImportError}
                </div>
              )}
            </div>

            {/* 씬 선택 */}
            {parsedScenes && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>씬 선택 ({selectedIndices.size}/{parsedScenes.length})</Label>
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {allSelected ? "전체 해제" : "전체 선택"}
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {parsedScenes.map((scene, idx) => {
                    const checked = selectedIndices.has(idx);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          checked
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:bg-secondary/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleScene(idx)}
                          className="mt-0.5 accent-primary"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            Scene {idx + 1}. {scene.title}
                          </p>
                          {scene.koreanTitle && (
                            <p className="text-xs text-muted-foreground">{scene.koreanTitle}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            대사 {scene.dialogues.length}개
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* 추가 모드 토글 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium">기존 씬 유지하고 추가</p>
                    <p className="text-xs text-muted-foreground">
                      {appendMode
                        ? "기존 씬은 그대로 두고, 선택한 씬을 뒤에 추가합니다."
                        : "기존 씬을 모두 삭제하고 선택한 씬만 남깁니다."}
                    </p>
                  </div>
                  <Switch
                    checked={appendMode}
                    onCheckedChange={setAppendMode}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleSceneImportClose(false)}
              disabled={sceneImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSceneImport}
              disabled={sceneImporting || !parsedScenes || selectedIndices.size === 0}
              className="rounded-xl"
            >
              {sceneImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 mr-2" />
                  {selectedIndices.size > 0
                    ? `씬 ${selectedIndices.size}개 Import`
                    : "씬 선택 필요"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
