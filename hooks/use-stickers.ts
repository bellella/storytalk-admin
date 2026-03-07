import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type StickerBasic = {
  id: number;
  code: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateStickerInput = {
  code: string;
  name: string;
  imageUrl: string;
  isActive?: boolean;
};

export type UpdateStickerInput = Partial<CreateStickerInput>;

async function fetchStickers(): Promise<StickerBasic[]> {
  const res = await fetch("/api/stickers");
  if (!res.ok) throw new Error("Failed to fetch stickers");
  return res.json();
}

export function useStickers() {
  return useQuery({
    queryKey: ["stickers"],
    queryFn: fetchStickers,
  });
}

export function useCreateSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStickerInput) => {
      const res = await fetch("/api/stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create sticker");
      return res.json() as Promise<StickerBasic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
  });
}

export function useUpdateSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateStickerInput & { id: number }) => {
      const res = await fetch(`/api/stickers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update sticker");
      return res.json() as Promise<StickerBasic>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
  });
}

export function useDeleteSticker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stickers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sticker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] });
    },
  });
}
