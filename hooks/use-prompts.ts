import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PromptType } from "@/src/generated/prisma/enums";

export type PromptVariable = {
  key: string;
  required: boolean;
  type: "string" | "number" | "boolean";
};

export type PromptTemplateBasic = {
  id: number;
  key: string;
  name: string;
  type: PromptType;
  description: string | null;
  content: string;
  variables: PromptVariable[] | null;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePromptInput = {
  key: string;
  name: string;
  type: PromptType;
  description?: string | null;
  content: string;
  variables?: PromptVariable[] | null;
  version?: number;
  isActive?: boolean;
};

export type UpdatePromptInput = Partial<CreatePromptInput>;

async function fetchPrompts(): Promise<PromptTemplateBasic[]> {
  const res = await fetch("/api/prompts");
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

export function usePrompts() {
  return useQuery({
    queryKey: ["prompts"],
    queryFn: fetchPrompts,
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePromptInput) => {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create prompt");
      return res.json() as Promise<PromptTemplateBasic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePromptInput & { id: number }) => {
      const res = await fetch(`/api/prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update prompt");
      return res.json() as Promise<PromptTemplateBasic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

export function useDeletePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prompt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}
