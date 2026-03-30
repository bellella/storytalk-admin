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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Gift, Loader2, UserPlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REWARD_TYPE_LABELS: Record<EpisodeRewardBasic["type"], string> = {
  COIN: "코인",
  COUPON: "쿠폰",
  CHARACTER_INVITE: "캐릭터 해금",
  XP: "XP",
  ITEM: "아이템",
};

const REWARD_TYPE_STYLES: Record<EpisodeRewardBasic["type"], string> = {
  COIN: "bg-amber-500/10 text-amber-700",
  COUPON: "bg-sky-500/10 text-sky-700",
  CHARACTER_INVITE: "bg-violet-500/10 text-violet-600",
  XP: "bg-emerald-500/10 text-emerald-700",
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
  const [rewardDescription, setRewardDescription] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [couponId, setCouponId] = useState("");

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
    mutationFn: async () => {
      const payload =
        selectedType === "CHARACTER_INVITE"
          ? { characterId: parseInt(selectedCharacterId, 10) }
          : selectedType === "COIN"
            ? { amount: Number(coinAmount) || 0 }
            : selectedType === "XP"
              ? { amount: Number(xpAmount) || 0 }
              : selectedType === "COUPON"
                ? { couponId: Number(couponId) || 0 }
                : selectedType === "ITEM"
                  ? ({} as Record<string, unknown>)
                  : {};
      const res = await fetch(`/api/episodes/${episodeId}/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          payload,
          description: rewardDescription.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add reward");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "rewards"] });
      queryClient.invalidateQueries({ queryKey: ["stories", storyId, "episodes", episodeId] });
      toast.success("리워드가 추가되었습니다.");
      setIsDialogOpen(false);
      setSelectedCharacterId("");
      setRewardDescription("");
      setCoinAmount("");
      setXpAmount("");
      setCouponId("");
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
      queryClient.invalidateQueries({ queryKey: ["stories", storyId, "episodes", episodeId] });
      toast.success("리워드가 삭제되었습니다.");
    },
    onError: () => toast.error("리워드 삭제 실패"),
  });

  const getRewardLabel = (reward: EpisodeRewardBasic) => {
    if (reward.type === "CHARACTER_INVITE") {
      const charId = reward.payload.characterId as number;
      const sc = storyCharacters.find((c) => c.characterId === charId);
      return sc ? sc.name : `Character #${charId}`;
    }
    if (reward.type === "COIN") {
      return `코인 ${(reward.payload.amount as number) ?? "?"}`;
    }
    if (reward.type === "XP") {
      return `XP ${(reward.payload.amount as number) ?? "?"}`;
    }
    if (reward.type === "COUPON") {
      return `쿠폰 #${(reward.payload.couponId as number) ?? "?"}`;
    }
    return JSON.stringify(reward.payload);
  };

  const canSubmit =
    selectedType === "CHARACTER_INVITE"
      ? !!selectedCharacterId
      : selectedType === "COIN"
        ? !!coinAmount.trim()
        : selectedType === "XP"
          ? !!xpAmount.trim()
          : selectedType === "COUPON"
            ? !!couponId.trim()
            : true;

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
          {!isLoading &&
            rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {reward.type === "CHARACTER_INVITE" ? (
                    <UserPlus className="w-5 h-5 text-primary" />
                  ) : reward.type === "COIN" || reward.type === "XP" ? (
                    <Sparkles className="w-5 h-5 text-primary" />
                  ) : (
                    <Gift className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  <p className="text-sm text-muted-foreground truncate">{getRewardLabel(reward)}</p>
                  {reward.description ? (
                    <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">
                      {reward.description}
                    </p>
                  ) : null}
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
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>에피소드 리워드 추가</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-1">
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
                  <SelectItem value="COIN" className="rounded-lg">
                    코인
                  </SelectItem>
                  <SelectItem value="XP" className="rounded-lg">
                    XP
                  </SelectItem>
                  <SelectItem value="COUPON" className="rounded-lg">
                    쿠폰
                  </SelectItem>
                  <SelectItem value="CHARACTER_INVITE" className="rounded-lg">
                    캐릭터 해금
                  </SelectItem>
                  <SelectItem value="ITEM" className="rounded-lg">
                    아이템
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">설명 (선택)</Label>
              <Input
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                placeholder="관리용 메모"
                className="rounded-xl bg-secondary border-0 h-9 text-sm"
              />
            </div>
            {selectedType === "COIN" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">코인 양</Label>
                <Input
                  type="number"
                  min={0}
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  className="rounded-xl bg-secondary border-0 h-9 text-sm"
                />
              </div>
            )}
            {selectedType === "XP" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">XP 양</Label>
                <Input
                  type="number"
                  min={0}
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  className="rounded-xl bg-secondary border-0 h-9 text-sm"
                />
              </div>
            )}
            {selectedType === "COUPON" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">쿠폰 ID</Label>
                <Input
                  type="number"
                  min={0}
                  value={couponId}
                  onChange={(e) => setCouponId(e.target.value)}
                  className="rounded-xl bg-secondary border-0 h-9 text-sm"
                />
              </div>
            )}
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
              onClick={() => addReward.mutate()}
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
