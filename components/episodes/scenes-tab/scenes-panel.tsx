"use client";

import type { SceneBasic, SceneType, SceneFlowTypeValue, BranchKeyItem, EndingBasic } from "@/types";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, GripVertical, ChevronRight, Settings2, Save, Loader2, X, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn } from "@/lib/utils";

type SceneFormData = {
  type: SceneType;
  flowType: SceneFlowTypeValue;
  branchKey: string;
  endingId: number | null;
  title: string;
  koreanTitle: string;
  bgImageUrl: string;
  data: string;
  status: "PUBLISHED" | "HIDDEN";
};

// ── Branch Trigger Editor (Scene level) ──────────────────────────────────────

function safeParseJson(v: string): Record<string, unknown> {
  try { return JSON.parse(v) as Record<string, unknown>; } catch { return {}; }
}

function SceneBranchTriggerEditor({
  value,
  onChange,
  branchKeys = [],
}: {
  value: string;
  onChange: (v: string) => void;
  branchKeys?: BranchKeyItem[];
}) {
  const parsed = safeParseJson(value);
  const threshold = typeof parsed.threshold === "number" ? parsed.threshold : 70;
  const selectionMode = parsed.selectionMode === "RANDOM" ? "RANDOM" : "TOP";
  // candidateKeys (new) | legacy: candidates (sceneId) → migrate to candidateKeys
  const rawCandidateKeys = Array.isArray(parsed.candidateKeys)
    ? (parsed.candidateKeys as string[])
    : Array.isArray(parsed.candidates)
      ? (parsed.candidates as { sceneId: number }[]).map((c) => `SCENE_${c.sceneId}`)
      : [];
  const candidateKeys = rawCandidateKeys.filter((k): k is string => typeof k === "string");
  const fallbackKeys = Array.isArray(parsed.fallbackKeys)
    ? (parsed.fallbackKeys as string[]).filter((k): k is string => typeof k === "string")
    : [];

  const emit = (patch: object) =>
    onChange(JSON.stringify({ threshold, selectionMode, candidateKeys, fallbackKeys, ...patch }));

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

      {/* Candidate Keys */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Candidate Keys</Label>
          <Button type="button" variant="ghost" size="sm" className="h-6 text-xs rounded-lg px-2"
            onClick={() => emit({ candidateKeys: [...candidateKeys, branchKeys[0]?.key ?? ""] })}
            disabled={branchKeys.length === 0}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {candidateKeys.map((key, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
              {branchKeys.length > 0 ? (
                <Select
                  value={key || "__none__"}
                  onValueChange={(v) => {
                    const next = [...candidateKeys];
                    next[i] = v === "__none__" ? "" : v;
                    emit({ candidateKeys: next });
                  }}
                >
                  <SelectTrigger className="rounded-xl bg-secondary border-0 h-8 flex-1 text-xs font-mono">
                    <SelectValue placeholder="branch key 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__" className="rounded-lg text-xs text-muted-foreground">—</SelectItem>
                    {key && !branchKeys.some((bk) => bk.key === key) && (
                      <SelectItem value={key} className="rounded-lg text-xs font-mono text-muted-foreground">
                        {key} (custom)
                      </SelectItem>
                    )}
                    {branchKeys.map((bk) => (
                      <SelectItem key={bk.key} value={bk.key} className="rounded-lg text-xs font-mono">
                        {bk.key}
                        {bk.name && <span className="text-muted-foreground ml-1">({bk.name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={key}
                  placeholder="에피소드에서 Branch Keys 정의 필요"
                  onChange={(e) => {
                    const next = [...candidateKeys];
                    next[i] = e.target.value;
                    emit({ candidateKeys: next });
                  }}
                  className="flex-1 rounded-xl bg-secondary border-0 h-8 text-xs font-mono"
                />
              )}
              <Button type="button" variant="ghost" size="icon"
                className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => emit({ candidateKeys: candidateKeys.filter((_, j) => j !== i) })}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {candidateKeys.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {branchKeys.length === 0 ? "에피소드에서 Branch Keys를 먼저 정의하세요" : "No candidates"}
            </p>
          )}
        </div>
      </div>

      {/* Fallback Keys */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Fallback Keys</Label>
          <Button type="button" variant="ghost" size="sm" className="h-6 text-xs rounded-lg px-2"
            onClick={() => emit({ fallbackKeys: [...fallbackKeys, branchKeys[0]?.key ?? ""] })}
            disabled={branchKeys.length === 0}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {fallbackKeys.map((key, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
              {branchKeys.length > 0 ? (
                <Select
                  value={key || "__none__"}
                  onValueChange={(v) => {
                    const next = [...fallbackKeys];
                    next[i] = v === "__none__" ? "" : v;
                    emit({ fallbackKeys: next });
                  }}
                >
                  <SelectTrigger className="rounded-xl bg-secondary border-0 h-8 flex-1 text-xs font-mono">
                    <SelectValue placeholder="branch key 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="__none__" className="rounded-lg text-xs text-muted-foreground">—</SelectItem>
                    {key && !branchKeys.some((bk) => bk.key === key) && (
                      <SelectItem value={key} className="rounded-lg text-xs font-mono text-muted-foreground">
                        {key} (custom)
                      </SelectItem>
                    )}
                    {branchKeys.map((bk) => (
                      <SelectItem key={bk.key} value={bk.key} className="rounded-lg text-xs font-mono">
                        {bk.key}
                        {bk.name && <span className="text-muted-foreground ml-1">({bk.name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={key}
                  placeholder="에피소드에서 Branch Keys 정의 필요"
                  onChange={(e) => {
                    const next = [...fallbackKeys];
                    next[i] = e.target.value;
                    emit({ fallbackKeys: next });
                  }}
                  className="flex-1 rounded-xl bg-secondary border-0 h-8 text-xs font-mono"
                />
              )}
              <Button type="button" variant="ghost" size="icon"
                className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => emit({ fallbackKeys: fallbackKeys.filter((_, j) => j !== i) })}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {fallbackKeys.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {branchKeys.length === 0 ? "에피소드에서 Branch Keys를 먼저 정의하세요" : "No fallbacks"}
            </p>
          )}
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
  onDeleteScenes?: (sceneIds: number[]) => Promise<void>;
  branchKeys?: BranchKeyItem[];
  endings?: EndingBasic[];
  /** PLAY 타입일 때만 엔딩 여부 스위치 사용 가능 */
  episodeType?: "UNIT" | "NOVEL" | "PLAY";
  onOpenBranchKeys?: () => void;
  saving: boolean;
  storyId: number;
  episodeId: number;
}

function SortableSceneItem({
  scene,
  isSelected,
  isDeleteSelected,
  onSelect,
  onOpenSettings,
  onToggleDeleteSelect,
}: {
  scene: SceneBasic;
  isSelected: boolean;
  isDeleteSelected?: boolean;
  onSelect: () => void;
  onOpenSettings: () => void;
  onToggleDeleteSelect?: (e: React.MouseEvent) => void;
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
        {onToggleDeleteSelect && (
          <input
            type="checkbox"
            checked={isDeleteSelected}
            onChange={(e) => { e.stopPropagation(); onToggleDeleteSelect(e as unknown as React.MouseEvent); }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "mt-0.5 accent-primary cursor-pointer flex-shrink-0 transition-opacity",
              !isDeleteSelected && "opacity-0 group-hover:opacity-100"
            )}
          />
        )}
        <button
          onClick={onSelect}
          className={cn(
            "flex-1 flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 min-w-0",
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
            !isSelected && scene.status === "HIDDEN" && "bg-muted",
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
              {scene.flowType === "BRANCH_AND_TRIGGER" && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-medium",
                  isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-amber-500/10 text-amber-600"
                )}>
                  BRANCH+TRIGGER
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
  onDeleteScenes,
  branchKeys = [],
  endings = [],
  episodeType,
  onOpenBranchKeys,
  saving,
}: ScenesPanelProps) {
  const sceneForm = useForm<SceneFormData>({
    defaultValues: { type: "VISUAL", flowType: "NORMAL", branchKey: "", endingId: null, title: "", koreanTitle: "", bgImageUrl: "", data: "{}", status: "PUBLISHED" },
  });

  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleSceneForDelete = (e: React.MouseEvent, sceneId: number) => {
    e.stopPropagation();
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) next.delete(sceneId);
      else next.add(sceneId);
      return next;
    });
  };

  const allSelected = scenes.length > 0 && selectedForDelete.size === scenes.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedForDelete(new Set());
    else setSelectedForDelete(new Set(scenes.map((s) => s.id)));
  };

  const handleDeleteSelected = async () => {
    if (!onDeleteScenes || selectedForDelete.size === 0) return;
    try {
      setDeleting(true);
      await onDeleteScenes(Array.from(selectedForDelete));
      setIsDeleteConfirmOpen(false);
      setSelectedForDelete(new Set());
    } finally {
      setDeleting(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (selectedScene) {
      const s = selectedScene.status === "PUBLISHED" || selectedScene.status === "HIDDEN"
        ? selectedScene.status
        : "PUBLISHED";
      sceneForm.reset({
        type: selectedScene.type || "VISUAL",
        flowType: selectedScene.flowType ?? "NORMAL",
        branchKey: selectedScene.branchKey ?? "",
        endingId: selectedScene.endingId ?? null,
        title: selectedScene.title,
        koreanTitle: selectedScene.koreanTitle || "",
        bgImageUrl: selectedScene.bgImageUrl || "",
        data: selectedScene.data ? JSON.stringify(selectedScene.data) : "{}",
        status: s,
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
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-medium">Scenes</CardTitle>
            <div className="flex items-center gap-1.5">
              {onDeleteScenes && scenes.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl h-8 text-muted-foreground hover:text-foreground"
                  onClick={toggleSelectAll}
                >
                  {allSelected ? "전체 해제" : "전체 선택"}
                </Button>
              )}
              {onDeleteScenes && selectedForDelete.size > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  선택 삭제 ({selectedForDelete.size})
                </Button>
              )}
              <Button size="sm" className="rounded-xl h-8" onClick={onCreateScene}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
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
                  isDeleteSelected={selectedForDelete.has(scene.id)}
                  onSelect={() => onSelectScene(scene)}
                  onOpenSettings={() => {
                    onSelectScene(scene);
                    setIsSettingsOpen(true);
                  }}
                  onToggleDeleteSelect={onDeleteScenes ? (e) => toggleSceneForDelete(e, scene.id) : undefined}
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
                      <SelectItem value="BRANCH_AND_TRIGGER" className="rounded-lg">BRANCH_AND_TRIGGER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(sceneForm.watch("flowType") === "BRANCH" ||
                sceneForm.watch("flowType") === "BRANCH_AND_TRIGGER") && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Branch Key</Label>
                    {branchKeys.length === 0 && onOpenBranchKeys && (
                      <button
                        type="button"
                        onClick={onOpenBranchKeys}
                        className="text-xs text-primary hover:underline"
                      >
                        Branch Keys 정의 →
                      </button>
                    )}
                  </div>
                  <Select
                    value={sceneForm.watch("branchKey") || "__none__"}
                    onValueChange={(v) =>
                      sceneForm.setValue("branchKey", v === "__none__" ? "" : v)
                    }
                    disabled={branchKeys.length === 0}
                  >
                    <SelectTrigger className="mt-1 rounded-xl bg-secondary border-0 h-9 text-sm font-mono">
                      <SelectValue
                        placeholder={
                          branchKeys.length === 0
                            ? "상단 Branch Keys에서 키를 정의하세요"
                            : "branch key 선택"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="__none__" className="rounded-lg text-xs text-muted-foreground">
                        —
                      </SelectItem>
                      {sceneForm.watch("branchKey") &&
                        branchKeys.length > 0 &&
                        !branchKeys.some((bk) => bk.key === sceneForm.watch("branchKey")) && (
                          <SelectItem
                            value={sceneForm.watch("branchKey")}
                            className="rounded-lg text-xs font-mono text-muted-foreground"
                          >
                            {sceneForm.watch("branchKey")} (custom)
                          </SelectItem>
                        )}
                      {branchKeys.map((bk) => (
                        <SelectItem key={bk.key} value={bk.key} className="rounded-lg text-xs font-mono">
                          {bk.key}
                          {bk.name && (
                            <span className="text-muted-foreground ml-1">({bk.name})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {branchKeys.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      에피소드 상단 [Branch Keys] 버튼에서 키를 추가한 뒤 Save하세요.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Label className="text-xs font-medium">엔딩 여부</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!sceneForm.watch("endingId")}
                    disabled={episodeType !== "PLAY" || (endings.length === 0 && !sceneForm.watch("endingId"))}
                    title={
                      episodeType !== "PLAY"
                        ? "PLAY 타입 에피소드에서만 사용 가능"
                        : endings.length === 0 && !sceneForm.watch("endingId")
                          ? "Endings 탭에서 엔딩을 먼저 추가하세요"
                          : undefined
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (endings.length > 0) {
                          sceneForm.setValue("endingId", endings[0].id);
                        }
                      } else {
                        sceneForm.setValue("endingId", null);
                      }
                    }}
                  />
                  {!!sceneForm.watch("endingId") && endings.length > 0 && (
                    <Select
                      value={String(sceneForm.watch("endingId") || "")}
                      onValueChange={(v) =>
                        sceneForm.setValue("endingId", v ? parseInt(v) : null)
                      }
                    >
                      <SelectTrigger className="w-[200px] rounded-xl bg-secondary border-0 h-8 text-sm font-mono">
                        <SelectValue placeholder="엔딩 선택" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {sceneForm.watch("endingId") &&
                          !endings.some((e) => e.id === sceneForm.watch("endingId")) && (
                            <SelectItem
                              value={String(sceneForm.watch("endingId"))}
                              className="rounded-lg text-xs text-muted-foreground"
                            >
                              #{sceneForm.watch("endingId")} (삭제됨)
                            </SelectItem>
                          )}
                        {endings.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)} className="rounded-lg text-xs font-mono">
                            {e.key}
                            {e.name && (
                              <span className="text-muted-foreground ml-1">({e.name})</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              {!!sceneForm.watch("endingId") && endings.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Endings 탭에서 엔딩을 먼저 추가하세요. (PLAY 타입 에피소드)
                </p>
              )}

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

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <Label className="text-xs font-medium">Status</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {sceneForm.watch("status") === "PUBLISHED" ? "PUBLISHED" : "HIDDEN"}
                  </span>
                  <Switch
                    checked={sceneForm.watch("status") === "PUBLISHED"}
                    onCheckedChange={(checked) =>
                      sceneForm.setValue("status", checked ? "PUBLISHED" : "HIDDEN")
                    }
                  />
                </div>
              </div>

              {(sceneForm.watch("flowType") === "BRANCH_TRIGGER" ||
                sceneForm.watch("flowType") === "BRANCH_AND_TRIGGER") && (
                <div>
                  <Label className="text-xs font-medium">Branch Trigger 설정</Label>
                  <div className="mt-1">
                    <SceneBranchTriggerEditor
                      value={sceneForm.watch("data")}
                      onChange={(v) => sceneForm.setValue("data", v)}
                      branchKeys={branchKeys}
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

      {/* Scene multi-delete confirm */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>선택 씬 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedForDelete.size}개 씬을 삭제합니다. 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeleteSelected}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
