import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EpisodeBasic, EpisodeWithScenes } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchEpisodes(storyId: number): Promise<EpisodeBasic[]> {
  const res = await fetch(`/api/stories/${storyId}/episodes`);
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}

async function fetchEpisode(storyId: number, episodeId: number): Promise<EpisodeWithScenes> {
  const res = await fetch(`/api/stories/${storyId}/episodes/${episodeId}`);
  if (!res.ok) throw new Error("Failed to fetch episode");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useEpisodes(storyId: number) {
  return useQuery({
    queryKey: ["stories", storyId, "episodes"],
    queryFn: () => fetchEpisodes(storyId),
    enabled: !!storyId,
  });
}

export function useEpisode(storyId: number, episodeId: number) {
  return useQuery({
    queryKey: ["stories", storyId, "episodes", episodeId],
    queryFn: () => fetchEpisode(storyId, episodeId),
    enabled: !!storyId && !!episodeId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EpisodeBasic> & { storyId: number }) => {
      const { storyId, ...body } = data;
      const res = await fetch(`/api/stories/${storyId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create episode");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories", variables.storyId, "episodes"] });
      queryClient.invalidateQueries({ queryKey: ["stories", variables.storyId], exact: true });
    },
  });
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Partial<EpisodeBasic> & { storyId: number; id: number }
    ) => {
      const { storyId, id, ...body } = data;
      const res = await fetch(`/api/stories/${storyId}/episodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update episode");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories", variables.storyId, "episodes"] });
      queryClient.invalidateQueries({
        queryKey: ["stories", variables.storyId, "episodes", variables.id],
      });
    },
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, id }: { storyId: number; id: number }) => {
      const res = await fetch(`/api/stories/${storyId}/episodes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete episode");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories", variables.storyId, "episodes"] });
      queryClient.invalidateQueries({ queryKey: ["stories", variables.storyId] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
