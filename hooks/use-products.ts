import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProductBasic, ProductWithEpisodes, EpisodeWithProduct } from "@/types";

// ─────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────

async function fetchProducts(params?: {
  type?: string;
  isActive?: string;
  search?: string;
}): Promise<ProductWithEpisodes[]> {
  const sp = new URLSearchParams();
  if (params?.type) sp.set("type", params.type);
  if (params?.isActive !== undefined && params.isActive !== "") sp.set("isActive", params.isActive);
  if (params?.search) sp.set("search", params.search);
  const res = await fetch(`/api/products?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function fetchProduct(id: number): Promise<ProductWithEpisodes> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

async function fetchAllEpisodes(params?: {
  storyId?: number;
  search?: string;
}): Promise<EpisodeWithProduct[]> {
  const sp = new URLSearchParams();
  if (params?.storyId) sp.set("storyId", String(params.storyId));
  if (params?.search) sp.set("search", params.search);
  const res = await fetch(`/api/episodes?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

export function useProducts(params?: { type?: string; isActive?: string; search?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useAllEpisodes(params?: { storyId?: number; search?: string }) {
  return useQuery({
    queryKey: ["episodes-all", params],
    queryFn: () => fetchAllEpisodes(params),
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ProductBasic, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProductBasic> & { id: number }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useLinkEpisode(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (episodeId: number) => {
      const res = await fetch(`/api/products/${productId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId }),
      });
      if (!res.ok) throw new Error("Failed to link episode");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["episodes-all"] });
    },
  });
}

export function useUnlinkEpisode(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (episodeId: number) => {
      const res = await fetch(`/api/products/${productId}/episodes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId }),
      });
      if (!res.ok) throw new Error("Failed to unlink episode");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["episodes-all"] });
    },
  });
}
