import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QuizBasic } from "@/types";

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchQuizzes(episodeId: number): Promise<QuizBasic[]> {
  const res = await fetch(`/api/episodes/${episodeId}/quizzes`);
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useQuizzes(episodeId: number) {
  return useQuery({
    queryKey: ["episodes", episodeId, "quizzes"],
    queryFn: () => fetchQuizzes(episodeId),
    enabled: !!episodeId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateQuiz(episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<QuizBasic>) => {
      const res = await fetch(`/api/episodes/${episodeId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "quizzes"] });
    },
  });
}

export function useUpdateQuiz(episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<QuizBasic> & { id: number }) => {
      const res = await fetch(`/api/episodes/${episodeId}/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update quiz");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "quizzes"] });
    },
  });
}

export function useDeleteQuiz(episodeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: number) => {
      const res = await fetch(`/api/episodes/${episodeId}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete quiz");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "quizzes"] });
    },
  });
}
