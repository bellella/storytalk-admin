import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NoticeAdmin } from "@/types";

async function fetchNotices(params?: { activeOnly?: boolean; search?: string }) {
  const sp = new URLSearchParams();
  if (params?.activeOnly) sp.set("activeOnly", "1");
  if (params?.search) sp.set("search", params.search);
  const res = await fetch(`/api/notices?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch notices");
  return res.json() as Promise<NoticeAdmin[]>;
}

export function useNotices(params?: { activeOnly?: boolean; search?: string }) {
  return useQuery({
    queryKey: ["notices", params],
    queryFn: () => fetchNotices(params),
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as { error?: string }).error || "Failed to create");
      }
      return res.json() as Promise<NoticeAdmin>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/notices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as { error?: string }).error || "Failed to update");
      }
      return res.json() as Promise<NoticeAdmin>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as { error?: string }).error || "Failed to delete");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}
