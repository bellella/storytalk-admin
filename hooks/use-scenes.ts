import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SceneBasic } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchScenes(storyId: number, episodeId: number): Promise<SceneBasic[]> {
  const res = await fetch(`/api/stories/${storyId}/episodes/${episodeId}/scenes`);
  if (!res.ok) throw new Error("Failed to fetch scenes");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useScenes(storyId: number, episodeId: number) {
  return useQuery({
    queryKey: ["stories", storyId, "episodes", episodeId, "scenes"],
    queryFn: () => fetchScenes(storyId, episodeId),
    enabled: !!storyId && !!episodeId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateScene(storyId: number, episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SceneBasic>) => {
      const res = await fetch(`/api/stories/${storyId}/episodes/${episodeId}/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create scene");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "episodes", episodeId, "scenes"],
      });
    },
  });
}

export function useUpdateScene(storyId: number, episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SceneBasic> & { id: number }) => {
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update scene");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "episodes", episodeId, "scenes"],
      });
    },
  });
}

export function useDeleteScene(storyId: number, episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sceneId: number) => {
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete scene");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "episodes", episodeId, "scenes"],
      });
    },
  });
}
