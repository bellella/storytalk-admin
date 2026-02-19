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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEpisode, useUpdateEpisode } from "@/hooks/use-episodes";
import { useStoryCharacters } from "@/hooks/use-story-characters";
import { ScenesPanel } from "@/components/episodes/scenes-tab/scenes-panel";
import { DialogueTimeline } from "@/components/episodes/scenes-tab/dialogue-timeline";
import { DialogueEditor } from "@/components/episodes/scenes-tab/dialogue-editor";
import { ReviewTab } from "@/components/episodes/review-tab";
import { QuizTab } from "@/components/episodes/quiz-tab";
import { RewardsTab } from "@/components/episodes/rewards-tab";
import { ImportExportDialogs } from "@/components/episodes/import-export-dialogs";
import type { SceneBasic, DialogueBasic, EpisodeWithScenes } from "@/types";
import { DialogueType } from "@/types";

const tabs = [
  { id: "scenes", label: "Scenes", icon: FileText },
  { id: "review", label: "Review", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "rewards", label: "Rewards", icon: Gift },
];

const VALID_TABS = ["scenes", "review", "quiz", "rewards"] as const;

type DialogueFormData = {
  characterId?: number;
  characterName?: string;
  type: (typeof DialogueType)[keyof typeof DialogueType];
  englishText: string;
  koreanText: string;
  charImageLabel: string;
  imageUrl: string;
  aiPromptName?: string;
  data?: string;
};

type SceneFormData = {
  type: "VISUAL" | "CHAT";
  title: string;
  koreanTitle: string;
  bgImageUrl: string;
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

  // Sync query data to local state
  useEffect(() => {
    if (episodeData) {
      setEpisode(episodeData);
      if (!selectedScene && episodeData.scenes?.length > 0) {
        setSelectedScene(episodeData.scenes[0]);
      }
    }
  }, [episodeData, selectedScene]);

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
        description: episode.description,
        status: episode.status,
      },
      {
        onError: (e) => setError(e.message),
      }
    );
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
            title: data.title,
            koreanTitle: data.koreanTitle || null,
            bgImageUrl: data.bgImageUrl || null,
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
      (data.type === DialogueType.CHOICE ||
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
            characterId: data.characterId,
            characterName: data.characterName,
            type: data.type,
            englishText: data.englishText,
            koreanText: data.koreanText,
            charImageLabel: data.charImageLabel,
            imageUrl: data.type === DialogueType.IMAGE ? data.imageUrl : null,
            aiPromptName: data.aiPromptName || null,
            data:
              data.type === DialogueType.CHOICE ||
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
      setDialogues(
        dialogues.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
      );
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

  const handleImportComplete = useCallback(async () => {
    await refetch();
  }, [refetch]);

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
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/stories/${storyId}?tab=episodes`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Story
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {episode.order}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Input
                  value={episode.title}
                  onChange={(e) =>
                    setEpisode({ ...episode, title: e.target.value })
                  }
                  className="text-2xl font-semibold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <StatusBadge status={episode.status} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={episode.description ?? ""}
                  onChange={(e) =>
                    setEpisode({ ...episode, description: e.target.value })
                  }
                  className="mt-2 text-2xl font-semibold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <p className="text-muted-foreground mt-1">
                Episode {episode.order} · {episode.scenes.length} scenes ·{" "}
                {dialogues.length} dialogs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              className="rounded-xl shadow-lg shadow-primary/25"
              onClick={handleSaveEpisode}
              disabled={updateEpisode.isPending}
            >
              {updateEpisode.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Episode
            </Button>
          </div>
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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scenes Tab */}
      {activeTab === "scenes" && (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          <ScenesPanel
            scenes={episode.scenes}
            selectedScene={selectedScene}
            onSelectScene={setSelectedScene}
            onCreateScene={handleCreateScene}
            onSaveScene={handleSaveScene}
            onReorderScenes={handleReorderScenes}
            saving={saving}
          />
          <DialogueTimeline
            dialogues={dialogues}
            selectedDialogue={selectedDialogue}
            onSelectDialogue={setSelectedDialogue}
            onCreateDialogue={handleCreateDialogueInScene}
            onReorderDialogues={handleReorderDialogues}
          />
          <DialogueEditor
            dialogue={selectedDialogue}
            characters={storyCharacters}
            saving={saving}
            onSave={handleSaveDialogue}
            onDelete={handleDeleteDialogue}
            onClose={() => setSelectedDialogue(null)}
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
      {activeTab === "rewards" && <RewardsTab rewards={episode.rewards} />}
    </AdminLayout>
  );
}
