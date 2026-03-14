"use client";

import type { SceneBasic, SceneType, SceneFlowTypeValue } from "@/types";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, GripVertical, ChevronRight, Settings2, Save, Loader2, X } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn } from "@/lib/utils";

type SceneFormData = {
  type: SceneType;
  flowType: SceneFlowTypeValue;
  title: string;
  koreanTitle: string;
  bgImageUrl: string;
  data: string;
};

// ── Branch Trigger Editor (Scene level) ──────────────────────────────────────

function safeParseJson(v: string): Record<string, unknown> {
  try { return JSON.parse(v) as Record<string, unknown>; } catch { return {}; }
}

function SceneBranchTriggerEditor({
  value,
  onChange,
  scenes = [],
}: {
  value: string;
  onChange: (v: string) => void;
  scenes?: SceneBasic[];
}) {
  const parsed = safeParseJson(value);
  const threshold = typeof parsed.threshold === "number" ? parsed.threshold : 70;
  const selectionMode = parsed.selectionMode === "RANDOM" ? "RANDOM" : "TOP";
  const candidates: { sceneId: number }[] = Array.isArray(parsed.candidates)
    ? (parsed.candidates as { sceneId: number }[])
    : [];
  const fallbackSceneIds: number[] = Array.isArray(parsed.fallbackSceneIds)
    ? (parsed.fallbackSceneIds as number[])
    : [];

  const emit = (patch: object) =>
    onChange(JSON.stringify({ threshold, selectionMode, candidates, fallbackSceneIds, ...patch }));

  return (
    <div className="space-y-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Threshold (%)</Label>
          <Input
            type="number" min={0} max={100} value={threshold}
            onChange={(e) => emit({ threshold: parseInt(e.target.value) || 0 })}
            className="mt-1 rounded-xl bg-secondary border-0 h-8"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Selection Mode</Label>
          <Select value={selectionMode} onValueChange={(v) => emit({ selectionMode: v })}>
            <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="TOP">TOP (최고점)</SelectItem>
              <SelectItem value="RANDOM">RANDOM (랜덤)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Candidates */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Candidates (씬 IDs)</Label>
          <Button type="button" variant="ghost" size="sm" className="h-6 text-xs rounded-lg px-2"
            onClick={() => emit({ candidates: [...candidates, { sceneId: 0 }] })}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {candidates.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
              <Select
                value={String(c.sceneId || "")}
                onValueChange={(v) => {
                  const next = [...candidates];
                  next[i] = { sceneId: parseInt(v) || 0 };
                  emit({ candidates: next });
                }}
              >
                <SelectTrigger className="rounded-xl bg-secondary border-0 h-8 flex-1 text-xs">
                  <SelectValue placeholder="Scene" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {scenes.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="rounded-lg text-xs">
                      #{s.id} {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon"
                className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => emit({ candidates: candidates.filter((_, j) => j !== i) })}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {candidates.length === 0 && <p className="text-xs text-muted-foreground">No candidates</p>}
        </div>
      </div>

      {/* Fallback Scene IDs */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Fallback Scene IDs</Label>
          <Button type="button" variant="ghost" size="sm" className="h-6 text-xs rounded-lg px-2"
            onClick={() => emit({ fallbackSceneIds: [...fallbackSceneIds, 0] })}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {fallbackSceneIds.map((id, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
              <Select
                value={String(id || "")}
                onValueChange={(v) => {
                  const next = [...fallbackSceneIds];
                  next[i] = parseInt(v) || 0;
                  emit({ fallbackSceneIds: next });
                }}
              >
                <SelectTrigger className="rounded-xl bg-secondary border-0 h-8 flex-1 text-xs">
                  <SelectValue placeholder="Scene" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {scenes.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="rounded-lg text-xs">
                      #{s.id} {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon"
                className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => emit({ fallbackSceneIds: fallbackSceneIds.filter((_, j) => j !== i) })}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
}

function SortableSceneItem({
  scene,
  isSelected,
  onSelect,
  onOpenSettings,
}: {
  scene: SceneBasic;
  isSelected: boolean;
  onSelect: () => void;
  onOpenSettings: () => void;
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
      <div className="group flex items-center gap-1">
        <button
          onClick={onSelect}
          className={cn(
            "flex-1 flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 min-w-0",
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
            isDragging && "opacity-50 shadow-lg"
          )}
        >
          <div
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical
              className={cn(
                "w-4 h-4",
                isSelected ? "text-primary-foreground/50" : "text-muted-foreground/50"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm truncate">{scene.title}</p>
              <span className={cn(
                "text-xs font-mono flex-shrink-0",
                isSelected ? "text-primary-foreground/50" : "text-muted-foreground/50"
              )}>
                #{scene.id}
              </span>
            </div>
            <p className={cn(
              "text-xs flex items-center gap-1.5 mt-0.5",
              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              <span>{scene.order}</span>
              {scene.type && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px]",
                  isSelected ? "bg-primary-foreground/20" : "bg-secondary/80"
                )}>
                  {scene.type}
                </span>
              )}
              {scene.flowType === "BRANCH" && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-medium",
                  isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-rose-500/10 text-rose-600"
                )}>
                  BRANCH
                </span>
              )}
              {scene.flowType === "BRANCH_TRIGGER" && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-medium",
                  isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-orange-500/10 text-orange-600"
                )}>
                  TRIGGER
                </span>
              )}
            </p>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 flex-shrink-0",
              isSelected ? "text-primary-foreground/50" : "text-muted-foreground/30"
            )}
          />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
          className={cn(
            "p-2 rounded-xl transition-all flex-shrink-0",
            "text-muted-foreground hover:text-foreground hover:bg-secondary",
            "opacity-0 group-hover:opacity-100",
            isSelected && "opacity-60 hover:opacity-100 hover:bg-primary-foreground/10 text-primary-foreground"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>
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
}: ScenesPanelProps) {
  const sceneForm = useForm<SceneFormData>({
    defaultValues: { type: "VISUAL", flowType: "NORMAL", title: "", koreanTitle: "", bgImageUrl: "", data: "{}" },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (selectedScene) {
      sceneForm.reset({
        type: selectedScene.type || "VISUAL",
        flowType: selectedScene.flowType ?? "NORMAL",
        title: selectedScene.title,
        koreanTitle: selectedScene.koreanTitle || "",
        bgImageUrl: selectedScene.bgImageUrl || "",
        data: selectedScene.data ? JSON.stringify(selectedScene.data) : "{}",
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

  return (
    <div className="col-span-3 min-w-0">
      {/* Scenes List */}
      <Card className="rounded-2xl border-border/50 shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Scenes</CardTitle>
            <Button size="sm" className="rounded-xl h-8" onClick={onCreateScene}>
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 p-3 pt-0">
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
                  onOpenSettings={() => {
                    onSelectScene(scene);
                    setIsSettingsOpen(true);
                  }}
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

      {/* Scene Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Settings2 className="w-4 h-4 text-primary" />
              Scene Settings
              {selectedScene && (
                <span className="text-xs font-normal text-muted-foreground font-mono">
                  #{selectedScene.id}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form
            className="flex-1 overflow-y-auto min-h-0"
            onSubmit={sceneForm.handleSubmit((data) => {
              onSaveScene(data);
              setIsSettingsOpen(false);
            })}
          >
            <div className="space-y-3 mt-1 pb-1">
              <div className="grid grid-cols-2 gap-2">
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
                      <SelectItem value="VISUAL" className="rounded-lg">VISUAL</SelectItem>
                      <SelectItem value="CHAT" className="rounded-lg">CHAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Flow Type</Label>
                  <Select
                    value={sceneForm.watch("flowType")}
                    onValueChange={(v: SceneFlowTypeValue) => sceneForm.setValue("flowType", v)}
                  >
                    <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="NORMAL" className="rounded-lg">NORMAL</SelectItem>
                      <SelectItem value="BRANCH" className="rounded-lg">BRANCH</SelectItem>
                      <SelectItem value="BRANCH_TRIGGER" className="rounded-lg">BRANCH_TRIGGER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

              {sceneForm.watch("flowType") === "BRANCH_TRIGGER" && (
                <div>
                  <Label className="text-xs font-medium">Branch Trigger 설정</Label>
                  <div className="mt-1">
                    <SceneBranchTriggerEditor
                      value={sceneForm.watch("data")}
                      onChange={(v) => sceneForm.setValue("data", v)}
                      scenes={scenes}
                    />
                  </div>
                </div>
              )}

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
                className="w-full rounded-xl h-9"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-3 h-3 mr-1.5" />
                )}
                Save Scene
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
