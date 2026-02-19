import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReviewItemBasic } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchReviewItems(episodeId: number): Promise<ReviewItemBasic[]> {
  const res = await fetch(`/api/episodes/${episodeId}/review-items`);
  if (!res.ok) throw new Error("Failed to fetch review items");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useReviewItems(episodeId: number) {
  return useQuery({
    queryKey: ["episodes", episodeId, "review-items"],
    queryFn: () => fetchReviewItems(episodeId),
    enabled: !!episodeId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateReviewItem(episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ReviewItemBasic>) => {
      const res = await fetch(`/api/episodes/${episodeId}/review-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create review item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "review-items"] });
    },
  });
}

export function useUpdateReviewItem(episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ReviewItemBasic> & { id: number }) => {
      const res = await fetch(`/api/episodes/${episodeId}/review-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update review item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "review-items"] });
    },
  });
}

export function useDeleteReviewItem(episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewItemId: number) => {
      const res = await fetch(`/api/episodes/${episodeId}/review-items/${reviewItemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "review-items"] });
    },
  });
}
