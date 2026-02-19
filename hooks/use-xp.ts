import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { XpLevelModel, XpRuleModel } from "@/src/generated/prisma/models";
import { XpTriggerType } from "@/src/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type XpLevelBasic = Pick<
  XpLevelModel,
  "level" | "requiredTotalXp" | "title" | "isActive" | "createdAt" | "updatedAt"
>;

export type XpRuleBasic = Pick<
  XpRuleModel,
  | "id"
  | "triggerType"
  | "xpAmount"
  | "startsAt"
  | "endsAt"
  | "priority"
  | "isActive"
  | "createdAt"
  | "updatedAt"
>;

export type XpTriggerTypeValue = `${XpTriggerType}`;

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchXpLevels(): Promise<XpLevelBasic[]> {
  const res = await fetch("/api/xp/levels");
  if (!res.ok) throw new Error("Failed to fetch XP levels");
  return res.json();
}

async function fetchXpRules(): Promise<XpRuleBasic[]> {
  const res = await fetch("/api/xp/rules");
  if (!res.ok) throw new Error("Failed to fetch XP rules");
  return res.json();
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useXpLevels() {
  return useQuery({
    queryKey: ["xp-levels"],
    queryFn: fetchXpLevels,
  });
}

export function useXpRules() {
  return useQuery({
    queryKey: ["xp-rules"],
    queryFn: fetchXpRules,
  });
}

// ---------------------------------------------------------------------------
// Mutations - XpLevel
// ---------------------------------------------------------------------------

type XpLevelInput = {
  level: number;
  requiredTotalXp: number;
  title?: string | null;
  isActive?: boolean;
};

export function useCreateXpLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: XpLevelInput) => {
      const res = await fetch("/api/xp/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create XP level");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xp-levels"] });
    },
  });
}

export function useUpdateXpLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: XpLevelInput) => {
      const res = await fetch(`/api/xp/levels/${data.level}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update XP level");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["xp-levels"] });
      queryClient.invalidateQueries({ queryKey: ["xp-levels", variables.level] });
    },
  });
}

export function useDeleteXpLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (level: number) => {
      const res = await fetch(`/api/xp/levels/${level}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete XP level");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xp-levels"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations - XpRule
// ---------------------------------------------------------------------------

type XpRuleInput = {
  id?: number;
  triggerType: XpTriggerTypeValue;
  xpAmount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  priority?: number;
  isActive?: boolean;
};

export function useCreateXpRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: XpRuleInput) => {
      const res = await fetch("/api/xp/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create XP rule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xp-rules"] });
    },
  });
}

export function useUpdateXpRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: XpRuleInput & { id: number }) => {
      const res = await fetch(`/api/xp/rules/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update XP rule");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["xp-rules"] });
      queryClient.invalidateQueries({ queryKey: ["xp-rules", variables.id] });
    },
  });
}

export function useDeleteXpRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/xp/rules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete XP rule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xp-rules"] });
    },
  });
}

