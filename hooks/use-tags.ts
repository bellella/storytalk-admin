import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TagBasic, StoryTagWithTag } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchTags(): Promise<TagBasic[]> {
  const res = await fetch("/api/tags");
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

async function fetchStoryTags(storyId: number): Promise<StoryTagWithTag[]> {
  const res = await fetch(`/api/stories/${storyId}/tags`);
  if (!res.ok) throw new Error("Failed to fetch story tags");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}

export function useStoryTags(storyId: number) {
  return useQuery({
    queryKey: ["stories", storyId, "tags"],
    queryFn: () => fetchStoryTags(storyId),
    enabled: !!storyId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { slug: string; color?: string; icon?: string }) => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useAddStoryTag(storyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: number) => {
      const res = await fetch(`/api/stories/${storyId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      });
      if (!res.ok) throw new Error("Failed to add tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", storyId, "tags"] });
      queryClient.invalidateQueries({ queryKey: ["stories", storyId] });
    },
  });
}

export function useRemoveStoryTag(storyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: number) => {
      const res = await fetch(`/api/stories/${storyId}/tags?tagId=${tagId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", storyId, "tags"] });
      queryClient.invalidateQueries({ queryKey: ["stories", storyId] });
    },
  });
}
