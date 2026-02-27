import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CollectionBasic, CollectionWithProducts } from "@/types";

// ─────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────

async function fetchCollections(): Promise<CollectionWithProducts[]> {
  const res = await fetch("/api/collections");
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

async function fetchCollection(id: number): Promise<CollectionWithProducts> {
  const res = await fetch(`/api/collections/${id}`);
  if (!res.ok) throw new Error("Failed to fetch collection");
  return res.json();
}

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });
}

export function useCollection(id: number) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: () => fetchCollection(id),
    enabled: !!id,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CollectionBasic, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CollectionBasic> & { id: number }) => {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update collection");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections", variables.id] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete collection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useReorderCollections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      // 순서대로 order 값 업데이트
      await Promise.all(
        ids.map((id, index) =>
          fetch(`/api/collections/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useAddCollectionProduct(collectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/collections/${collectionId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to add product to collection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useRemoveCollectionProduct(collectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(
        `/api/collections/${collectionId}/products/${productId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove product from collection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useReorderCollectionProducts(collectionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      const res = await fetch(`/api/collections/${collectionId}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to reorder products");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", collectionId] });
    },
  });
}
