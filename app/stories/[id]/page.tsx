"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  UserCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useStory, useUpdateStory } from "@/hooks/use-stories";
import {
  useStoryCharacters,
  useLinkCharacter,
  useUnlinkCharacter,
  useUpdateStoryCharacterName,
} from "@/hooks/use-story-characters";
import { useCharacters } from "@/hooks/use-characters";
import {
  useTags,
  useStoryTags,
  useAddStoryTag,
  useRemoveStoryTag,
  useCreateTag,
} from "@/hooks/use-tags";
import { useCreateEpisode } from "@/hooks/use-episodes";
import { StoryOverviewTab } from "@/components/stories/story-overview-tab";
import { StoryEpisodesTab } from "@/components/stories/story-episodes-tab";
import { StoryCharactersTab } from "@/components/stories/story-characters-tab";
import type { StoryWithRelations, StoryType } from "@/types";

const tabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "episodes", label: "Episodes", icon: FileText },
  { id: "characters", label: "Characters", icon: UserCircle },
];

const VALID_TABS = ["overview", "episodes", "characters"] as const;

export default function StoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = Number(params.id);

  const tabFromUrl = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])
    ? tabFromUrl
    : "overview";

  const setActiveTab = (tab: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`/stories/${storyId}?${next.toString()}`, { scroll: false });
  };

  const { data: storyData, isLoading, error } = useStory(storyId);
  const { data: storyCharacters = [] } = useStoryCharacters(storyId);
  const { data: allCharacters = [] } = useCharacters();

  const { data: allTags = [] } = useTags();
  const { data: storyTags = [] } = useStoryTags(storyId);

  const queryClient = useQueryClient();
  const updateStory = useUpdateStory();
  const linkCharacter = useLinkCharacter(storyId);
  const unlinkCharacter = useUnlinkCharacter(storyId);
  const updateCharacterName = useUpdateStoryCharacterName(storyId);
  const createEpisode = useCreateEpisode();
  const addStoryTag = useAddStoryTag(storyId);
  const removeStoryTag = useRemoveStoryTag(storyId);
  const createTag = useCreateTag();

  const [story, setStory] = useState<StoryWithRelations | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");

  useEffect(() => {
    if (storyData && !hasUnsavedChanges) {
      setStory(storyData);
    }
  }, [storyData, hasUnsavedChanges]);

  const handleUpdate = (field: string, value: string | number | StoryType) => {
    if (!story) return;
    setStory({ ...story, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!story) return;
    updateStory.mutate(
      {
        id: storyId,
        title: story.title,
        type: story.type,
        category: story.category,
        icon: story.icon,
        level: story.level,
        description: story.description,
        coverImage: story.coverImage,
        status: story.status,
      },
      { onSuccess: () => setHasUnsavedChanges(false) }
    );
  };

  const handlePublish = () => {
    if (!story) return;
    updateStory.mutate(
      { id: storyId, status: "PUBLISHED" },
      {
        onSuccess: () => {
          setStory({ ...story, status: "PUBLISHED" });
          setHasUnsavedChanges(false);
        },
      }
    );
  };

  const handleCreateEpisode = () => {
    const nextOrder = (story?.episodes?.length ?? 0) + 1;
    createEpisode.mutate({
      storyId,
      title: `Episode ${nextOrder}`,
      order: nextOrder,
    });
  };

  const [reorderingEpisodes, setReorderingEpisodes] = useState(false);
  const handleReorderEpisodes = async (reorderedEpisodes: { id: number }[]) => {
    if (!story) return;
    setReorderingEpisodes(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/episodes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeIds: reorderedEpisodes.map((e) => e.id) }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      const updated = await res.json();
      setStory({ ...story, episodes: updated });
      queryClient.invalidateQueries({ queryKey: ["stories", storyId] });
    } catch (e) {
      console.error(e);
    } finally {
      setReorderingEpisodes(false);
    }
  };

  const handleSelectCharacter = (characterId: number) => {
    const character = allCharacters.find((c) => c.id === characterId);
    if (!character) return;
    linkCharacter.mutate(
      { characterId, name: character.name },
      { onSuccess: () => setIsCharacterDialogOpen(false) }
    );
  };

  const handleRemoveCharacter = (id: number) => {
    if (!confirm("Remove this character from the story?")) return;
    unlinkCharacter.mutate(id);
  };

  const handleUpdateCharacterName = (id: number, name: string) => {
    updateCharacterName.mutate({ id, name });
  };

  const handleCreateStoryCharacter = () => {
    if (!newCharacterName.trim()) return;
    linkCharacter.mutate(
      { name: newCharacterName.trim() },
      { onSuccess: () => setNewCharacterName("") }
    );
  };

  const saving = updateStory.isPending;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading story...
        </div>
      </AdminLayout>
    );
  }

  if (error || !story) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-destructive">
          Failed to load story: {(error as Error)?.message || "Not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stories
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              {story.icon || "📖"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {story.title}
                </h1>
                <StatusBadge status={story.status} />
              </div>
              <p className="text-muted-foreground mt-1">
                {story.type === "UNIT"
                  ? "Unit"
                  : story.type === "PLAY"
                    ? "Play"
                    : "Novel"}
                {story.category ? ` · ${story.category}` : ""} · {story.level} ·{" "}
                {story.episodes?.length ?? 0} episodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-warning">Unsaved changes</span>
            )}
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
            {story.status === "DRAFT" && (
              <Button
                className="rounded-xl shadow-lg shadow-primary/25"
                onClick={handlePublish}
                disabled={saving}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <StoryOverviewTab
          story={story}
          onUpdate={handleUpdate}
          allTags={allTags}
          storyTags={storyTags}
          onAddTag={(tagId) => addStoryTag.mutate(tagId)}
          onRemoveTag={(tagId) => removeStoryTag.mutate(tagId)}
          onCreateTag={(slug) =>
            createTag.mutate(
              { slug },
              {
                onSuccess: (tag) => addStoryTag.mutate(tag.id),
              }
            )
          }
        />
      )}

      {activeTab === "episodes" && (
        <StoryEpisodesTab
          storyId={storyId}
          episodes={story.episodes ?? []}
          onCreateEpisode={handleCreateEpisode}
          onReorderEpisodes={handleReorderEpisodes}
          reordering={reorderingEpisodes}
        />
      )}

      {activeTab === "characters" && (
        <StoryCharactersTab
          storyId={storyId}
          characters={storyCharacters}
          onAddCharacter={() => setIsCharacterDialogOpen(true)}
          onRemoveCharacter={handleRemoveCharacter}
          onUpdateCharacterName={handleUpdateCharacterName}
          isDialogOpen={isCharacterDialogOpen}
          onDialogChange={setIsCharacterDialogOpen}
          allCharacters={allCharacters}
          onSelectCharacter={handleSelectCharacter}
          newCharacterName={newCharacterName}
          onNewCharacterNameChange={setNewCharacterName}
          onCreateStoryCharacter={handleCreateStoryCharacter}
        />
      )}
    </AdminLayout>
  );
}
