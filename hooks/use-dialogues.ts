import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DialogueBasic } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchDialogues(
  storyId: number,
  episodeId: number,
  sceneId: number
): Promise<DialogueBasic[]> {
  const res = await fetch(
    `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues`
  );
  if (!res.ok) throw new Error("Failed to fetch dialogues");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useDialogues(storyId: number, episodeId: number, sceneId: number) {
  return useQuery({
    queryKey: ["stories", storyId, "episodes", episodeId, "scenes", sceneId, "dialogues"],
    queryFn: () => fetchDialogues(storyId, episodeId, sceneId),
    enabled: !!storyId && !!episodeId && !!sceneId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateDialogue(storyId: number, episodeId: number, sceneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<DialogueBasic>) => {
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to create dialogue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "episodes", episodeId, "scenes", sceneId, "dialogues"],
      });
    },
  });
}

export function useUpdateDialogue(storyId: number, episodeId: number, sceneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DialogueBasic> & { id: number }) => {
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update dialogue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "episodes", episodeId, "scenes", sceneId, "dialogues"],
      });
    },
  });
}

export function useDeleteDialogue(storyId: number, episodeId: number, sceneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dialogueId: number) => {
      const res = await fetch(
        `/api/stories/${storyId}/episodes/${episodeId}/scenes/${sceneId}/dialogues/${dialogueId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete dialogue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stories", storyId, "episodes", episodeId, "scenes", sceneId, "dialogues"],
      });
    },
  });
}
