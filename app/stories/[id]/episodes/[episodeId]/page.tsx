"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  FileText,
  Gift,
  BookOpen,
  HelpCircle,
  Loader2,
  X,
  Plus,
  Key,
  Trophy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEpisode, useUpdateEpisode } from "@/hooks/use-episodes";
import { useStoryCharacters } from "@/hooks/use-story-characters";
import { ScenesPanel } from "@/components/episodes/scenes-tab/scenes-panel";
import { DialogueTimeline } from "@/components/episodes/scenes-tab/dialogue-timeline";
import { DialogueEditor } from "@/components/episodes/scenes-tab/dialogue-editor";
import { ReviewTab } from "@/components/episodes/review-tab";
import { QuizTab } from "@/components/episodes/quiz-tab";
import { RewardsTab } from "@/components/episodes/rewards-tab";
import { EndingsTab } from "@/components/episodes/endings-tab";
import { ImportExportDialogs } from "@/components/episodes/import-export-dialogs";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SceneBasic, DialogueBasic, EpisodeWithScenes, BranchKeyItem } from "@/types";
import { DialogueType, EpisodeType, PlayEpisodeMode } from "@/types";

const tabs = [
  { id: "scenes", label: "Scenes", icon: FileText },
  { id: "review", label: "Review", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "endings", label: "Endings", icon: Trophy },
];

const VALID_TABS = ["scenes", "review", "quiz", "rewards", "endings"] as const;

type DialogueFormData = {
  characterId?: number;
  characterName?: string;
  type: (typeof DialogueType)[keyof typeof DialogueType];
  flowType: "NORMAL" | "BRANCH";
  speakerRole: "SYSTEM" | "USER";
  englishText: string;
  koreanText: string;
  charImageLabel: string;
  imageUrl: string;
  aiPromptName?: string;
  data?: string;
};

type SceneFormData = {
  type: "VISUAL" | "CHAT";
  flowType: "NORMAL" | "BRANCH" | "BRANCH_TRIGGER" | "BRANCH_AND_TRIGGER";
  branchKey: string;
  endingId: number | null;
  title: string;
  koreanTitle: string;
  bgImageUrl: string;
  data: string;
  status: "PUBLISHED" | "HIDDEN";
};

export default function EpisodeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = Number(params.id);
  const episodeId = Number(params.episodeId);

  const tabFromUrl = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(
    tabFromUrl as (typeof VALID_TABS)[number]
  )
    ? tabFromUrl
    : "scenes";

  const setActiveTab = (tab: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(
      `/stories/${storyId}/episodes/${episodeId}?${next.toString()}`,
      { scroll: false }
    );
  };

  const {
    data: episodeData,
    isLoading,
    error: fetchError,
    refetch,
  } = useEpisode(storyId, episodeId);
  const { data: storyCharacters = [] } = useStoryCharacters(storyId);
  const updateEpisode = useUpdateEpisode();

  const [episode, setEpisode] = useState<EpisodeWithScenes | null>(null);
  const [selectedScene, setSelectedScene] = useState<SceneBasic | null>(null);
  const [dialogues, setDialogues] = useState<DialogueBasic[]>([]);
  const [selectedDialogue, setSelectedDialogue] =
    useState<DialogueBasic | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isBranchKeysOpen, setIsBranchKeysOpen] = useState(false);

  // Sync query data to local state (only when episodeData from server changes)
  // DO NOT include selectedScene - that would overwrite local updates with stale cache
  useEffect(() => {
    if (episodeData) {
      setEpisode(episodeData);
      setSelectedScene((prev) => {
        if (!episodeData.scenes?.length) return prev;
        if (!prev) return episodeData.scenes[0];
        const found = episodeData.scenes.find((s) => s.id === prev.id);
        return found ?? episodeData.scenes[0];
      });
    }
  }, [episodeData]);

  // Fetch dialogues when scene changes
  useEffect(() => {
    if (!selectedScene) return;
    const fetchDialogues = async () => {
      try {
        const res = await fetch(
          `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`
        );
        if (!res.ok) throw new Error("Failed to fetch dialogues");
        const data = await res.json();
        setDialogues(data);
        if (data.length > 0) {
          setSelectedDialogue(data[0]);
        } else {
          setSelectedDialogue(null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDialogues();
  }, [selectedScene, storyId, episodeId]);

  const handleSaveEpisode = () => {
    if (!episode) return;
    updateEpisode.mutate(
      {
        storyId,
        id: episodeId,
        title: episode.title,
        type: episode.type,
        playMode: episode.playMode ?? null,
        description: episode.description,
        thumbnailUrl: episode.thumbnailUrl ?? null,
        totalScenes: episode.totalScenes ?? null,
        data: episode.data ?? null,
        status: episode.status,
      },
      {
        onError: (e) => setError(e.message),
      }
    );
  };

  const branchKeys: BranchKeyItem[] = Array.isArray((episode?.data as any)?.branchKeys)
    ? ((episode?.data as any)?.branchKeys as BranchKeyItem[])
    : [];

  const setBranchKeys = (next: BranchKeyItem[]) => {
    if (!episode) return;
    setEpisode({
      ...episode,
      data: { ...(episode.data as object || {}), branchKeys: next },
    });
  };

  const handleCreateScene = async () => {
    if (!episode) return;
    try {
      const nextOrder = episode.scenes.length + 1;
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Scene ${nextOrder}`,
            order: nextOrder,
            type: "VISUAL",
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create scene");
      const newScene = await res.json();
      setEpisode({ ...episode, scenes: [...episode.scenes, newScene] });
      setSelectedScene(newScene);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create scene");
    }
  };

  const handleSaveScene = async (data: SceneFormData) => {
    if (!selectedScene || !episode) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: data.type,
            flowType: data.flowType,
            branchKey: (data.flowType === "BRANCH" || data.flowType === "BRANCH_AND_TRIGGER")
              ? (data.branchKey || null)
              : null,
            endingId: data.endingId ?? null,
            title: data.title,
            koreanTitle: data.koreanTitle || null,
            bgImageUrl: data.bgImageUrl || null,
            status: data.status,
            ...((data.flowType === "BRANCH_TRIGGER" || data.flowType === "BRANCH_AND_TRIGGER") && data.data?.trim()
              ? (() => {
                  try { return { data: JSON.parse(data.data) }; } catch { return {}; }
                })()
              : { data: null }),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save scene");
      const updated = await res.json();
      setEpisode({
        ...episode,
        scenes: episode.scenes.map((s) =>
          s.id === updated.id ? { ...s, ...updated } : s
        ),
      });
      setSelectedScene({ ...selectedScene, ...updated });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save scene");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDialogue = async (data: DialogueFormData) => {
    if (!selectedDialogue || !selectedScene) return;

    let parsedData: Record<string, unknown> | null = null;
    if (
      (data.type === DialogueType.CHOICE_SLOT ||
        data.type === DialogueType.AI_INPUT_SLOT ||
        data.type === DialogueType.AI_SLOT) &&
      data.data?.trim()
    ) {
      try {
        const p = JSON.parse(data.data);
        if (typeof p !== "object" || p === null) {
          setError("Data must be a JSON object");
          return;
        }
        parsedData = p;
      } catch (e) {
        setError(`Invalid JSON in Data: ${e instanceof Error ? e.message : "parse error"}`);
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues/${selectedDialogue.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId:
              data.speakerRole === "USER" ? null : data.characterId,
            characterName:
              data.speakerRole === "USER" ? null : data.characterName,
            type: data.type,
            flowType: data.flowType,
            speakerRole: data.speakerRole,
            englishText: data.englishText,
            koreanText: data.koreanText,
            charImageLabel: data.charImageLabel,
            imageUrl: data.type === DialogueType.IMAGE ? data.imageUrl : null,
            aiPromptName: data.aiPromptName || null,
            data:
              data.type === DialogueType.CHOICE_SLOT ||
              data.type === DialogueType.AI_INPUT_SLOT ||
              data.type === DialogueType.AI_SLOT
                ? parsedData
                : undefined,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save dialogue");
      }
      const updated = await res.json();
      const newList = dialogues.map((d) => (d.id === updated.id ? { ...d, ...updated } : d));
      setDialogues(newList);
      setSelectedDialogue((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save dialogue");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDialogueInScene = async () => {
    if (!selectedScene) return;
    try {
      const nextOrder = (dialogues.length ?? 0) + 1;
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: nextOrder,
            englishText: "",
            koreanText: "",
            charImageLabel: "default",
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create dialogue");
      const newDialogue = await res.json();
      const dialoguesRes = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`
      );
      if (dialoguesRes.ok) {
        const updatedDialogues = await dialoguesRes.json();
        setDialogues(updatedDialogues);
        setSelectedDialogue(
          updatedDialogues.find(
            (d: DialogueBasic) => d.id === newDialogue.id
          ) || newDialogue
        );
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create dialogue");
    }
  };

  const handleDeleteScenes = async (sceneIds: number[]) => {
    if (!episode) return;
    try {
      setSaving(true);
      for (const id of sceneIds) {
        const res = await fetch(
          `/api/stories/${storyId}/episodes/${episodeId}/scenes/${id}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error(`Failed to delete scene ${id}`);
      }
      await refetch();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete scenes");
    } finally {
      setSaving(false);
    }
  };

  const handleReorderScenes = async (reorderedScenes: SceneBasic[]) => {
    if (!episode) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneIds: reorderedScenes.map((s) => s.id),
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to reorder scenes");
      }
      const updatedScenes = await res.json();
      setEpisode({ ...episode, scenes: updatedScenes });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reorder scenes");
    } finally {
      setSaving(false);
    }
  };

  const handleReorderDialogues = async (
    reorderedDialogues: DialogueBasic[]
  ) => {
    if (!selectedScene) return;
    try {
      setSaving(true);
      const dialogueIds = reorderedDialogues.map((d) => d.id);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dialogueIds }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to reorder (${res.status})`);
      }
      const updated = await res.json();
      setDialogues(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reorder dialogues");
    } finally {
      setSaving(false);
    }
  };

  const queryClient = useQueryClient();
  const handleImportComplete = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["stories", storyId, "episodes", episodeId],
    });
  }, [queryClient, storyId, episodeId]);

  const handleDialoguesChanged = useCallback((newDialogues: DialogueBasic[]) => {
    setDialogues(newDialogues);
    setSelectedDialogue((prev) =>
      prev && newDialogues.find((d) => d.id === prev.id) ? prev : (newDialogues[0] ?? null)
    );
  }, []);

  const handleDeleteDialogue = async (dialogue: DialogueBasic) => {
    if (!selectedScene) return;
    try {
      setSaving(true);
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${selectedScene.id}/dialogues/${dialogue.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      const newList = dialogues.filter((d) => d.id !== dialogue.id);
      const idx = dialogues.findIndex((d) => d.id === dialogue.id);
      setDialogues(newList);
      setSelectedDialogue(newList[idx] ?? newList[idx - 1] ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete dialogue");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading episode...
        </div>
      </AdminLayout>
    );
  }

  if (fetchError || !episode) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-destructive">
          Failed to load episode:{" "}
          {(fetchError as Error)?.message || "Not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header - compact single row + tabs */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Link
            href={`/stories/${storyId}?tab=episodes`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-medium">Episode {episode.order}</span>
          <StatusBadge status={episode.status} />
          <span className="text-xs text-muted-foreground">
            {episode.scenes.length} scenes · {dialogues.length} dialogs
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <Input
            value={episode.title}
            onChange={(e) => setEpisode({ ...episode, title: e.target.value })}
            placeholder="Episode title"
            className="flex-1 min-w-[200px] max-w-md text-lg font-semibold bg-secondary/50 border-0 rounded-xl h-9"
          />
          <Input
            value={episode.description ?? ""}
            onChange={(e) => setEpisode({ ...episode, description: e.target.value })}
            placeholder="Description"
            className="flex-1 min-w-[180px] max-w-sm text-sm bg-secondary/50 border-0 rounded-xl h-9"
          />
          <Select
            value={episode.type ?? "NOVEL"}
            onValueChange={(value: EpisodeType) =>
              setEpisode({ ...episode, type: value, playMode: value === "PLAY" ? (episode.playMode ?? PlayEpisodeMode.ROLEPLAY) : null })
            }
          >
            <SelectTrigger className="w-28 rounded-xl bg-secondary/50 border-0 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="NOVEL" className="rounded-lg">Novel</SelectItem>
              <SelectItem value="PLAY" className="rounded-lg">Play</SelectItem>
            </SelectContent>
          </Select>
          {episode.type === "PLAY" && (
            <Select
              value={episode.playMode ?? PlayEpisodeMode.ROLEPLAY}
              onValueChange={(value: PlayEpisodeMode) =>
                setEpisode({ ...episode, playMode: value })
              }
            >
              <SelectTrigger className="w-40 rounded-xl bg-secondary/50 border-0 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={PlayEpisodeMode.ROLEPLAY} className="rounded-lg">Roleplay</SelectItem>
                <SelectItem value={PlayEpisodeMode.ROLEPLAY_WITH_EVAL} className="rounded-lg">Roleplay+Eval</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Input
            type="number"
            min={0}
            value={episode.totalScenes ?? ""}
            onChange={(e) =>
              setEpisode({ ...episode, totalScenes: e.target.value === "" ? null : parseInt(e.target.value) })
            }
            placeholder="Scenes"
            className="w-20 rounded-xl bg-secondary/50 border-0 h-9 text-sm text-center"
          />
          <div className="w-24 flex-shrink-0">
            <ImageUploader
              value={episode.thumbnailUrl ?? ""}
              onChange={(url) => setEpisode({ ...episode, thumbnailUrl: url || null })}
              label=""
              aspectRatio="video"
              maxSizeMB={5}
            />
          </div>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setIsBranchKeysOpen(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            Branch Keys
          </Button>
          <ImportExportDialogs
            storyId={storyId}
            episodeId={episodeId}
            episodeOrder={episode.order}
            scenes={episode.scenes}
            isImportOpen={isImportDialogOpen}
            isExportOpen={isExportDialogOpen}
            onImportOpenChange={setIsImportDialogOpen}
            onExportOpenChange={setIsExportDialogOpen}
            onImportComplete={handleImportComplete}
          />
          <Button
            className="rounded-xl shadow-lg shadow-primary/25 h-9"
            onClick={handleSaveEpisode}
            disabled={updateEpisode.isPending}
          >
            {updateEpisode.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={() => setError(null)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-secondary/50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const isEndingsDisabled = tab.id === "endings" && episode.type !== "PLAY";
          return (
            <button
              key={tab.id}
              onClick={() => !isEndingsDisabled && setActiveTab(tab.id)}
              disabled={isEndingsDisabled}
              title={isEndingsDisabled ? "PLAY 타입에서만 사용 가능" : undefined}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                isEndingsDisabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scenes Tab - main 하나의 스크롤만 사용 */}
      {activeTab === "scenes" && (
        <div className="grid grid-cols-12 gap-6 min-w-0">
          <ScenesPanel
            scenes={episode.scenes}
            selectedScene={selectedScene}
            onSelectScene={setSelectedScene}
            onCreateScene={handleCreateScene}
            onSaveScene={handleSaveScene}
            onReorderScenes={handleReorderScenes}
            onDeleteScenes={handleDeleteScenes}
            branchKeys={branchKeys}
            endings={episode.endings ?? []}
            onOpenBranchKeys={() => setIsBranchKeysOpen(true)}
            saving={saving}
            storyId={storyId}
            episodeId={episodeId}
          />
          <DialogueTimeline
            dialogues={dialogues}
            selectedDialogue={selectedDialogue}
            onSelectDialogue={setSelectedDialogue}
            onCreateDialogue={handleCreateDialogueInScene}
            onReorderDialogues={handleReorderDialogues}
            storyId={storyId}
            episodeId={episodeId}
            sceneId={selectedScene?.id}
            onDialoguesChanged={handleDialoguesChanged}
          />
          <DialogueEditor
            dialogue={selectedDialogue}
            characters={storyCharacters}
            scenes={episode.scenes}
            branchKeys={branchKeys}
            saving={saving}
            storyId={storyId}
            episodeId={episodeId}
            sceneId={selectedScene?.id}
            onSave={handleSaveDialogue}
            onDelete={handleDeleteDialogue}
            onClose={() => setSelectedDialogue(null)}
            onDialogueCreated={(d) => setDialogues((prev) => [...prev, d])}
          />
        </div>
      )}

      {/* Review Tab */}
      {activeTab === "review" && (
        <ReviewTab
          episodeId={episodeId}
          storyId={storyId}
          scenes={episode.scenes}
        />
      )}

      {/* Quiz Tab */}
      {activeTab === "quiz" && <QuizTab episodeId={episodeId} />}

      {/* Rewards Tab */}
      {activeTab === "rewards" && <RewardsTab storyId={storyId} episodeId={episodeId} />}

      {/* Endings Tab (PLAY only) */}
      {activeTab === "endings" && episode.type === "PLAY" && (
        <EndingsTab storyId={storyId} episodeId={episodeId} />
      )}
      {activeTab === "endings" && episode.type !== "PLAY" && (
        <div className="py-12 text-center text-muted-foreground">
          Endings는 PLAY 타입 에피소드에서만 사용할 수 있습니다.
        </div>
      )}

      {/* Branch Keys Dialog */}
      <Dialog open={isBranchKeysOpen} onOpenChange={setIsBranchKeysOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Branch Keys
            </DialogTitle>
            <DialogDescription>
              Choice Slot의 branchScoreDelta에서 사용할 route key를 정의합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {branchKeys.map((bk, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={bk.key}
                  placeholder="key (e.g. BADA_ROUTE)"
                  onChange={(e) => {
                    const next = [...branchKeys];
                    next[i] = { ...next[i], key: e.target.value };
                    setBranchKeys(next);
                  }}
                  className="flex-1 rounded-xl bg-secondary border-0 h-8 text-sm font-mono"
                />
                <Input
                  value={bk.name}
                  placeholder="name"
                  onChange={(e) => {
                    const next = [...branchKeys];
                    next[i] = { ...next[i], name: e.target.value };
                    setBranchKeys(next);
                  }}
                  className="flex-1 rounded-xl bg-secondary border-0 h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => setBranchKeys(branchKeys.filter((_, j) => j !== i))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setBranchKeys([...branchKeys, { key: "", name: "" }])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Branch Key
            </Button>
          </div>
          <DialogFooter>
            <p className="text-xs text-muted-foreground mr-auto">에피소드 save 필요</p>
            <Button className="rounded-xl" onClick={() => setIsBranchKeysOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
