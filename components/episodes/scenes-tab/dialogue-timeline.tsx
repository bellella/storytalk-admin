"use client";

import { useState } from "react";
import type { DialogueBasic, SceneBasic } from "@/types";
import { DialogueType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  GripVertical,
  FileText,
  Image as ImageIcon,
  Heading as HeadingIcon,
  ListChecks,
  MessageSquare,
  Bot,
  Target,
  Upload,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const DIALOGUE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }
> = {
  [DialogueType.DIALOGUE]: { label: "Dialogue", icon: MessageSquare, badgeClass: "bg-primary/10 text-primary" },
  [DialogueType.NARRATION]: { label: "Narration", icon: FileText, badgeClass: "bg-amber-500/10 text-amber-600" },
  [DialogueType.IMAGE]: { label: "Image", icon: ImageIcon, badgeClass: "bg-violet-500/10 text-violet-600" },
  [DialogueType.HEADING]: { label: "Heading", icon: HeadingIcon, badgeClass: "bg-sky-500/10 text-sky-600" },
  [DialogueType.CHOICE_SLOT]: { label: "Choice Slot", icon: ListChecks, badgeClass: "bg-emerald-500/10 text-emerald-600" },
  [DialogueType.AI_INPUT_SLOT]: { label: "AI Input", icon: MessageSquare, badgeClass: "bg-orange-500/10 text-orange-600" },
  [DialogueType.AI_SLOT]: { label: "AI Slot", icon: Bot, badgeClass: "bg-indigo-500/10 text-indigo-600" },
  [DialogueType.SPEAKING_MISSION]: { label: "Speaking Mission", icon: Target, badgeClass: "bg-pink-500/10 text-pink-600" },
  [DialogueType.BG_CHANGE]: { label: "BG Change", icon: ImageIcon, badgeClass: "bg-teal-500/10 text-teal-600" },
};

function getDialogueTypeConfig(type: string) {
  return DIALOGUE_TYPE_CONFIG[type] ?? {
    label: type,
    icon: FileText,
    badgeClass: "bg-muted text-muted-foreground",
  };
}

interface DialogueTimelineProps {
  dialogues: DialogueBasic[];
  selectedDialogue: DialogueBasic | null;
  onSelectDialogue: (dialogue: DialogueBasic) => void;
  onCreateDialogue: () => void;
  onReorderDialogues: (reorderedDialogues: DialogueBasic[]) => void;
  storyId: number;
  episodeId: number;
  sceneId: number | undefined;
  scene?: SceneBasic | null;
  onDialoguesChanged: (dialogues: DialogueBasic[]) => void;
  /** 씬 메타 업데이트 시 에피소드 refetch (Import에 scene 포함된 경우) */
  onImportComplete?: () => void;
}

function SortableDialogueItem({
  dialogue,
  isSelected,
  isDeleteSelected,
  onSelect,
  onToggleDeleteSelect,
}: {
  dialogue: DialogueBasic;
  isSelected: boolean;
  isDeleteSelected?: boolean;
  onSelect: () => void;
  onToggleDeleteSelect?: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dialogue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="group flex items-center gap-1">
        {onToggleDeleteSelect && (
          <input
            type="checkbox"
            checked={isDeleteSelected}
            onChange={(e) => { e.stopPropagation(); onToggleDeleteSelect(e as unknown as React.MouseEvent); }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "accent-primary cursor-pointer flex-shrink-0 transition-opacity",
              !isDeleteSelected && "opacity-0 group-hover:opacity-100"
            )}
          />
        )}
        <button
          onClick={onSelect}
          className={cn(
            "flex-1 w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
            isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-secondary",
            isDragging && "opacity-50 shadow-lg"
          )}
        >
        <div
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        </div>
        {dialogue.type === DialogueType.DIALOGUE ||
        dialogue.type === DialogueType.AI_INPUT_SLOT ||
        dialogue.type === DialogueType.AI_SLOT ? (
          <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm">
              {dialogue.characterName?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            {(() => {
              const { icon: Icon } = getDialogueTypeConfig(dialogue.type);
              return <Icon className="w-5 h-5 text-muted-foreground" />;
            })()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-sm text-foreground">
              {dialogue.type === DialogueType.DIALOGUE ||
              dialogue.type === DialogueType.AI_INPUT_SLOT ||
              dialogue.type === DialogueType.AI_SLOT
                ? dialogue.characterName ?? getDialogueTypeConfig(dialogue.type).label
                : getDialogueTypeConfig(dialogue.type).label}
            </span>
            <span className="text-xs text-muted-foreground/60 font-mono">
              #{dialogue.id}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                getDialogueTypeConfig(dialogue.type).badgeClass
              )}
            >
              {getDialogueTypeConfig(dialogue.type).label}
            </span>
            {dialogue.flowType === "BRANCH" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium">
                BRANCH
              </span>
            )}
            {(dialogue.type === DialogueType.DIALOGUE ||
              dialogue.type === DialogueType.AI_INPUT_SLOT ||
              dialogue.type === DialogueType.AI_SLOT) &&
              dialogue.charImageLabel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                {dialogue.charImageLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {dialogue.englishText}
          </p>
        </div>
        </button>
      </div>
    </div>
  );
}

export function DialogueTimeline({
  dialogues,
  selectedDialogue,
  onSelectDialogue,
  onCreateDialogue,
  onReorderDialogues,
  storyId,
  episodeId,
  sceneId,
  scene,
  onDialoguesChanged,
  onImportComplete,
}: DialogueTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Export state
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Delete all state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Multi-select delete state
  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());
  const [isDeleteSelectedConfirmOpen, setIsDeleteSelectedConfirmOpen] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  const toggleDialogueForDelete = (e: React.MouseEvent, dialogueId: number) => {
    e.stopPropagation();
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(dialogueId)) next.delete(dialogueId);
      else next.add(dialogueId);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (!sceneId || selectedForDelete.size === 0) return;
    try {
      setDeletingSelected(true);
      for (const id of selectedForDelete) {
        const res = await fetch(
          `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues/${id}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error(`Failed to delete dialogue ${id}`);
      }
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues`
      );
      if (res.ok) {
        const updated = await res.json();
        onDialoguesChanged(updated);
      }
      setIsDeleteSelectedConfirmOpen(false);
      setSelectedForDelete(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingSelected(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dialogues.findIndex((d) => d.id === active.id);
    const newIndex = dialogues.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(dialogues, oldIndex, newIndex);
    onReorderDialogues(reordered);
  };

  const handleImport = async () => {
    if (!sceneId) return;
    setImportError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      setImportError("유효하지 않은 JSON입니다.");
      return;
    }

    const obj = typeof parsed === "object" && parsed != null ? (parsed as Record<string, unknown>) : {};
    const sceneObj = obj.scene && typeof obj.scene === "object" ? (obj.scene as Record<string, unknown>) : null;

    // dialogues: top-level obj.dialogues 또는 scene 안의 scene.dialogues
    let dialoguesArray: unknown[] | null = Array.isArray(parsed)
      ? parsed
      : Array.isArray(obj.dialogues)
        ? obj.dialogues
        : sceneObj && Array.isArray(sceneObj.dialogues)
          ? sceneObj.dialogues
          : null;

    if (!Array.isArray(dialoguesArray) || dialoguesArray.length === 0) {
      setImportError('dialogues 배열을 찾을 수 없습니다. { "dialogues": [...] } 또는 { "scene": { "dialogues": [...], "title": "..." } } 형태로 붙여넣으세요.');
      return;
    }

    // scene 메타: scene에서 dialogues만 제외 (title, type, koreanTitle 등 유지)
    const rawScene = sceneObj ?? (obj.scene && typeof obj.scene === "object" ? obj.scene : null);
    const sceneMeta = rawScene
      ? (() => {
          const s = { ...(rawScene as Record<string, unknown>) };
          delete s.dialogues;
          return Object.keys(s).length > 0 ? s : undefined;
        })()
      : undefined;

    try {
      setImporting(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId,
            dialogues: dialoguesArray,
            ...(sceneMeta && { scene: sceneMeta }),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Import 실패");
      }

      const fetchRes = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues`
      );
      if (fetchRes.ok) {
        const updated = await fetchRes.json();
        onDialoguesChanged(updated);
      }
      await onImportComplete?.();
      setIsImportOpen(false);
      setImportJson("");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import 실패");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!sceneId) return;
    try {
      setDeletingAll(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dialogues: [] }),
        }
      );
      if (res.ok) {
        onDialoguesChanged([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingAll(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="col-span-5 min-w-0">
      <Card className="rounded-2xl border-border/50 shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-medium">Dialog Timeline</CardTitle>
            <div className="flex items-center gap-1.5">
              {sceneId && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-8 gap-1.5 text-xs"
                    onClick={() => {
                      setImportJson("");
                      setImportError(null);
                      setIsImportOpen(true);
                    }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-8 gap-1.5 text-xs"
                    onClick={() => setIsExportOpen(true)}
                    disabled={dialogues.length === 0}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </Button>
                  {selectedForDelete.size > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={() => setIsDeleteSelectedConfirmOpen(true)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      선택 삭제 ({selectedForDelete.size})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={dialogues.length === 0}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    전체 삭제
                  </Button>
                </>
              )}
              <Button
                size="sm"
                className="rounded-xl h-8"
                onClick={onCreateDialogue}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Dialog
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dialogues.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {dialogues.map((dialogue) => (
                <SortableDialogueItem
                  key={dialogue.id}
                  dialogue={dialogue}
                  isSelected={selectedDialogue?.id === dialogue.id}
                  isDeleteSelected={selectedForDelete.has(dialogue.id)}
                  onSelect={() => onSelectDialogue(dialogue)}
                  onToggleDeleteSelect={sceneId ? (e) => toggleDialogueForDelete(e, dialogue.id) : undefined}
                />
              ))}
            </SortableContext>
          </DndContext>
          {dialogues.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No dialogues in this scene
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={(open) => { if (!open) { setIsImportOpen(false); setImportJson(""); setImportError(null); } }}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>씬별 Import</DialogTitle>
            <DialogDescription>
              현재 씬의 대화를 치환합니다. scene이 포함되면 씬 메타(title, type, flowType 등)도 업데이트됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={importJson}
              onChange={(e) => { setImportJson(e.target.value); setImportError(null); }}
              placeholder={'{ "dialogues": [...], "scene": { "title": "...", "type": "VISUAL" } }'}
              className="font-mono text-xs h-52 rounded-xl resize-none"
            />
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => { setIsImportOpen(false); setImportJson(""); setImportError(null); }}
              disabled={importing}
            >
              취소
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleImport}
              disabled={importing || !importJson.trim()}
            >
              {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {importing ? "Import 중..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>대화 Export</DialogTitle>
            <DialogDescription>
              현재 씬의 대화 {dialogues.length}개를 JSON으로 내보냅니다. Import 시 사용할 수 있는 형식입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={JSON.stringify({
                ...(scene && { scene: { type: scene.type, flowType: scene.flowType, title: scene.title, koreanTitle: scene.koreanTitle, bgImageUrl: scene.bgImageUrl, data: scene.data } }),
                dialogues: dialogues.map((d) => ({ order: d.order, type: d.type, speakerRole: d.speakerRole ?? "SYSTEM", characterName: d.characterName || "", charImageLabel: d.charImageLabel, englishText: d.englishText, koreanText: d.koreanText, imageUrl: d.imageUrl, audioUrl: d.audioUrl, ...(d.aiPromptName != null && { aiPromptName: d.aiPromptName }), data: d.data ?? null, flowType: d.flowType })),
              }, null, 2)}
              readOnly
              className="font-mono text-xs h-52 rounded-xl resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsExportOpen(false)}>
              닫기
            </Button>
            <Button
              className="rounded-xl"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(JSON.stringify({
                ...(scene && { scene: { type: scene.type, flowType: scene.flowType, title: scene.title, koreanTitle: scene.koreanTitle, bgImageUrl: scene.bgImageUrl, data: scene.data } }),
                dialogues: dialogues.map((d) => ({ order: d.order, type: d.type, speakerRole: d.speakerRole ?? "SYSTEM", characterName: d.characterName || "", charImageLabel: d.charImageLabel, englishText: d.englishText, koreanText: d.koreanText, imageUrl: d.imageUrl, audioUrl: d.audioUrl, ...(d.aiPromptName != null && { aiPromptName: d.aiPromptName }), data: d.data ?? null, flowType: d.flowType })),
              }, null, 2))}
            >
              복사
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirm Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>전체 대화 삭제</DialogTitle>
            <DialogDescription>
              이 씬의 대화 {dialogues.length}개를 모두 삭제합니다. 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deletingAll}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeleteAll}
              disabled={deletingAll}
            >
              {deletingAll && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              전체 삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Selected Confirm Dialog */}
      <Dialog open={isDeleteSelectedConfirmOpen} onOpenChange={setIsDeleteSelectedConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>선택 대화 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedForDelete.size}개 대화를 삭제합니다. 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsDeleteSelectedConfirmOpen(false)}
              disabled={deletingSelected}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeleteSelected}
              disabled={deletingSelected}
            >
              {deletingSelected && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
