"use client";

import type { SceneBasic, SceneType } from "@/types";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, GripVertical, ChevronRight, Settings2, Save, Loader2, Upload } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn } from "@/lib/utils";

type SceneFormData = {
  type: SceneType;
  title: string;
  koreanTitle: string;
  bgImageUrl: string;
};

interface ScenesPanelProps {
  scenes: SceneBasic[];
  selectedScene: SceneBasic | null;
  onSelectScene: (scene: SceneBasic) => void;
  onCreateScene: () => void;
  onSaveScene: (data: SceneFormData) => void;
  onReorderScenes: (reorderedScenes: SceneBasic[]) => void;
  saving: boolean;
  storyId: number;
  episodeId: number;
  onImportComplete?: (sceneId: number) => void;
}

function SortableSceneItem({
  scene,
  isSelected,
  onSelect,
}: {
  scene: SceneBasic;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button
        onClick={onSelect}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
          isDragging && "opacity-50 shadow-lg"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical
            className={cn(
              "w-4 h-4 flex-shrink-0",
              isSelected ? "text-primary-foreground/50" : "text-muted-foreground/50"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{scene.title}</p>
          <p
            className={cn(
              "text-xs flex items-center gap-1.5",
              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            <span>{scene.order}</span>
            {scene.type && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary/80">
                {scene.type}
              </span>
            )}
          </p>
        </div>
        <ChevronRight
          className={cn(
            "w-4 h-4",
            isSelected ? "text-primary-foreground/50" : "text-muted-foreground/30"
          )}
        />
      </button>
    </div>
  );
}

export function ScenesPanel({
  scenes,
  selectedScene,
  onSelectScene,
  onCreateScene,
  onSaveScene,
  onReorderScenes,
  saving,
  storyId,
  episodeId,
  onImportComplete,
}: ScenesPanelProps) {
  const sceneForm = useForm<SceneFormData>({
    defaultValues: { type: "VISUAL", title: "", koreanTitle: "", bgImageUrl: "" },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [importingScene, setImportingScene] = useState<SceneBasic | null>(null);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedScene) {
      sceneForm.reset({
        type: selectedScene.type || "VISUAL",
        title: selectedScene.title,
        koreanTitle: selectedScene.koreanTitle || "",
        bgImageUrl: selectedScene.bgImageUrl || "",
      });
    }
  }, [selectedScene, sceneForm]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = scenes.findIndex((s) => s.id === active.id);
    const newIndex = scenes.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(scenes, oldIndex, newIndex);
    onReorderScenes(reordered);
  };

  const closeImportDialog = () => {
    setImportingScene(null);
    setImportJson("");
    setImportError(null);
  };

  const handleSceneImport = async () => {
    if (!importingScene) return;
    setImportError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      setImportError("유효하지 않은 JSON입니다.");
      return;
    }

    const dialoguesArray = Array.isArray(parsed)
      ? parsed
      : (parsed as Record<string, unknown>).dialogues;

    if (!Array.isArray(dialoguesArray)) {
      setImportError('dialogues 배열을 찾을 수 없습니다. 배열이나 { "dialogues": [...] } 형태로 붙여넣으세요.');
      return;
    }

    try {
      setImporting(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${importingScene.id}/dialogues`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dialogues: dialoguesArray }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error((err.error as string) || "Import 실패");
      }
      closeImportDialog();
      onImportComplete?.(importingScene.id);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import 실패");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="col-span-3 flex flex-col gap-4 h-full">
      {/* Scenes List */}
      <Card className="rounded-2xl border-border/50 shadow-sm flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Scenes</CardTitle>
            <Button size="sm" className="rounded-xl h-8" onClick={onCreateScene}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-2 p-3 pt-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={scenes.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {scenes.map((scene) => (
                <SortableSceneItem
                  key={scene.id}
                  scene={scene}
                  isSelected={selectedScene?.id === scene.id}
                  onSelect={() => onSelectScene(scene)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {scenes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No scenes yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scene Settings */}
      {selectedScene && (
        <Card className="rounded-2xl border-border/50 shadow-sm flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-medium">Scene Settings</CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl h-8 gap-1.5 text-xs"
                onClick={() => {
                  setImportingScene(selectedScene);
                  setImportJson("");
                  setImportError(null);
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0">
            <form onSubmit={sceneForm.handleSubmit(onSaveScene)}>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <Select
                    value={sceneForm.watch("type")}
                    onValueChange={(v: SceneType) => sceneForm.setValue("type", v)}
                  >
                    <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="VISUAL" className="rounded-lg">
                        VISUAL
                      </SelectItem>
                      <SelectItem value="CHAT" className="rounded-lg">
                        CHAT
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Title</Label>
                  <Input
                    {...sceneForm.register("title")}
                    className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm"
                    placeholder="Scene title"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Korean Title</Label>
                  <Input
                    {...sceneForm.register("koreanTitle")}
                    className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm"
                    placeholder="한글 제목"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Background Image</Label>
                  <ImageUploader
                    value={sceneForm.watch("bgImageUrl")}
                    onChange={(url) => sceneForm.setValue("bgImageUrl", url)}
                    aspectRatio="video"
                    maxSizeMB={10}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full rounded-xl h-8"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 mr-1" />
                  )}
                  Save Scene
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Per-Scene Import Dialog */}
      <Dialog
        open={!!importingScene}
        onOpenChange={(open) => { if (!open) closeImportDialog(); }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>대화 Import</DialogTitle>
            <DialogDescription>
              &quot;{importingScene?.title}&quot; 씬의 대화를 교체합니다. 기존 대화가 모두 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={'dialogues 배열이나 { "dialogues": [...] } JSON을 붙여넣으세요'}
              className="font-mono text-xs h-48 rounded-xl resize-none"
            />
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={closeImportDialog}>
              취소
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleSceneImport}
              disabled={importing || !importJson.trim()}
            >
              {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
