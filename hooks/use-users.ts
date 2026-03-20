import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useUsers(search = "") {
  return useQuery({
    queryKey: ["users", { search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json() as Promise<{
        users: UserBasic[];
        stats: { total: number; active: number; premium: number };
      }>;
    },
  });
}

export function useUser(userId: number) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json() as Promise<UserDetail>;
    },
    enabled: !!userId,
  });
}

export function useUserEpisodeProgress(userId: number) {
  return useQuery({
    queryKey: ["users", userId, "progress", "episodes"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/progress/episodes`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUserStoryProgress(userId: number) {
  return useQuery({
    queryKey: ["users", userId, "progress", "stories"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/progress/stories`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUserCharacters(userId: number) {
  return useQuery({
    queryKey: ["users", userId, "friends"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/friends`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUserBookmarks(userId: number) {
  return useQuery({
    queryKey: ["users", userId, "bookmarks"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/bookmarks/dialogues`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUserPlayEpisodes(userId: number) {
  return useQuery({
    queryKey: ["users", userId, "play-episodes"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/play-episodes`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useUpdateUserPlayEpisodeData(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playEpisodeId,
      data,
    }: {
      playEpisodeId: number;
      data: unknown;
    }) => {
      const res = await fetch(
        `/api/users/${userId}/play-episodes/${playEpisodeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "play-episodes"] });
    },
  });
}

export function useResetUserPlayEpisode(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playEpisodeId: number) => {
      const res = await fetch(
        `/api/users/${userId}/play-episodes/${playEpisodeId}/reset`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to reset");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "play-episodes"] });
    },
  });
}

export function useDeleteUserPlayEpisode(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playEpisodeId: number) => {
      const res = await fetch(
        `/api/users/${userId}/play-episodes/${playEpisodeId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete");
      }
      return res.json() as Promise<{ deleted: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "play-episodes"] });
    },
  });
}

export function useDeletePlayEpisodeSlot(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playEpisodeId,
      slotId,
    }: {
      playEpisodeId: number;
      slotId: number;
    }) => {
      const res = await fetch(
        `/api/users/${userId}/play-episodes/${playEpisodeId}/slots/${slotId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete");
      }
      return res.json() as Promise<{ deleted: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "play-episodes"] });
    },
  });
}

// Types
export type UserBasic = {
  id: number;
  name: string | null;
  email: string;
  profileImage: string | null;
  XpLevel: number;
  xp: number;
  streakDays: number;
  lastLoginAt: string;
  registeredAt: string | null;
  hasPremium: boolean;
  status: "active" | "inactive";
};

export type UserDetail = UserBasic & {
  _count: {
    userEpisodes: number;
    storyProgress: number;
    characterFriends: number;
    dialogueBookmarks: number;
  };
};
