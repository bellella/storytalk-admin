import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ImageBasic = {
  id: number;
  name: string | null;
  url: string;
  type: string | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchImages(search?: string, type?: string): Promise<ImageBasic[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  const res = await fetch(`/api/images?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

/** useQuery로 캐시 공유 - 여러 ImageUploader가 있어도 한 번만 fetch */
export function useImages(options?: { search?: string; type?: string }) {
  const search = options?.search ?? "";
  const type = options?.type ?? "";
  return useQuery({
    queryKey: ["images", search, type],
    queryFn: () => fetchImages(search || undefined, type || undefined),
  });
}

export function useCreateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { url: string; name?: string; type?: string }) => {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create image");
      return res.json() as Promise<ImageBasic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; url?: string; name?: string; type?: string }) => {
      const res = await fetch(`/api/images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update image");
      return res.json() as Promise<ImageBasic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}
