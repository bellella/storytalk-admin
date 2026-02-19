import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { StoryCharacterWithCharacter } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchStoryCharacters(
  storyId: number
): Promise<StoryCharacterWithCharacter[]> {
  const res = await fetch(`/api/stories/${storyId}/characters`);
  if (!res.ok) throw new Error("Failed to fetch story characters");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useStoryCharacters(storyId: number) {
  return useQuery({
    queryKey: ["stories", storyId, "characters"],
    queryFn: () => fetchStoryCharacters(storyId),
    enabled: !!storyId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useLinkCharacter(storyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { characterId?: number; name: string }) => {
      const res = await fetch(`/api/stories/${storyId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to link character");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "characters"],
      });
      queryClient.invalidateQueries({ queryKey: ["stories", storyId] });
    },
  });
}

export function useUpdateStoryCharacterName(storyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: number; name: string }) => {
      const res = await fetch(`/api/stories/${storyId}/characters`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update character name");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "characters"],
      });
    },
  });
}

export function useUnlinkCharacter(storyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stories/${storyId}/characters?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unlink character");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "characters"],
      });
      queryClient.invalidateQueries({ queryKey: ["stories", storyId] });
    },
  });
}
