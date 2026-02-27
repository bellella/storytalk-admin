"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EpisodeRewardBasic } from "@/types";
import { useStoryCharacters } from "@/hooks/use-story-characters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Gift, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REWARD_TYPE_LABELS: Record<EpisodeRewardBasic["type"], string> = {
  CHARACTER_INVITE: "캐릭터 초대",
  ITEM: "아이템",
};

const REWARD_TYPE_STYLES: Record<EpisodeRewardBasic["type"], string> = {
  CHARACTER_INVITE: "bg-violet-500/10 text-violet-600",
  ITEM: "bg-blue-500/10 text-blue-600",
};

interface RewardsTabProps {
  storyId: number;
  episodeId: number;
}

export function RewardsTab({ storyId, episodeId }: RewardsTabProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EpisodeRewardBasic["type"]>("CHARACTER_INVITE");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  const { data: rewards = [], isLoading } = useQuery<EpisodeRewardBasic[]>({
    queryKey: ["episodes", episodeId, "rewards"],
    queryFn: async () => {
      const res = await fetch(`/api/episodes/${episodeId}/rewards`);
      if (!res.ok) throw new Error("Failed to fetch rewards");
      return res.json();
    },
  });

  const { data: storyCharacters = [] } = useStoryCharacters(storyId);

  const addReward = useMutation({
    mutationFn: async (data: { type: string; payload: Record<string, unknown> }) => {
      const res = await fetch(`/api/episodes/${episodeId}/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add reward");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "rewards"] });
      toast.success("리워드가 추가되었습니다.");
      setIsDialogOpen(false);
      setSelectedCharacterId("");
    },
    onError: () => toast.error("리워드 추가 실패"),
  });

  const deleteReward = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/episodes/${episodeId}/rewards?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete reward");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "rewards"] });
      toast.success("리워드가 삭제되었습니다.");
    },
    onError: () => toast.error("리워드 삭제 실패"),
  });

  const handleAdd = () => {
    if (selectedType === "CHARACTER_INVITE") {
      if (!selectedCharacterId) return;
      addReward.mutate({
        type: selectedType,
        payload: { characterId: parseInt(selectedCharacterId) },
      });
    } else {
      addReward.mutate({ type: selectedType, payload: {} });
    }
  };

  const getRewardLabel = (reward: EpisodeRewardBasic) => {
    if (reward.type === "CHARACTER_INVITE") {
      const charId = reward.payload.characterId as number;
      const sc = storyCharacters.find((c) => c.characterId === charId);
      return sc ? sc.name : `Character #${charId}`;
    }
    return JSON.stringify(reward.payload);
  };

  const canSubmit =
    selectedType === "CHARACTER_INVITE" ? !!selectedCharacterId : true;

  return (
    <div className="max-w-2xl">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Episode Rewards ({rewards.length})
            </CardTitle>
            <Button size="sm" className="rounded-xl" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reward
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              로딩 중...
            </div>
          )}
          {!isLoading && rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {reward.type === "CHARACTER_INVITE" ? (
                  <UserPlus className="w-5 h-5 text-primary" />
                ) : (
                  <Gift className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      REWARD_TYPE_STYLES[reward.type]
                    )}
                  >
                    {REWARD_TYPE_LABELS[reward.type]}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      reward.isActive
                        ? "bg-green-500/10 text-green-600"
                        : "bg-gray-500/10 text-gray-600"
                    )}
                  >
                    {reward.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {getRewardLabel(reward)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl flex-shrink-0"
                onClick={() => deleteReward.mutate(reward.id)}
                disabled={deleteReward.isPending}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          {!isLoading && rewards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No rewards configured
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>리워드 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">타입</Label>
              <Select
                value={selectedType}
                onValueChange={(v) => {
                  setSelectedType(v as EpisodeRewardBasic["type"]);
                  setSelectedCharacterId("");
                }}
              >
                <SelectTrigger className="rounded-xl bg-secondary border-0 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="CHARACTER_INVITE" className="rounded-lg">
                    캐릭터 초대
                  </SelectItem>
                  <SelectItem value="ITEM" className="rounded-lg">
                    아이템
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedType === "CHARACTER_INVITE" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">캐릭터</Label>
                <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                  <SelectTrigger className="rounded-xl bg-secondary border-0 h-9 text-sm">
                    <SelectValue placeholder="캐릭터 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {storyCharacters.map((sc) => (
                      <SelectItem
                        key={sc.characterId}
                        value={String(sc.characterId)}
                        className="rounded-lg"
                      >
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleAdd}
              disabled={addReward.isPending || !canSubmit}
            >
              {addReward.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
