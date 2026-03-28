"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EndingWithRewards, EndingRewardBasic } from "@/types";
import { useStoryCharacters } from "@/hooks/use-story-characters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Trash2,
  Gift,
  Loader2,
  UserPlus,
  Trophy,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";

const REWARD_TYPE_LABELS: Record<EndingRewardBasic["type"], string> = {
  COIN: "코인",
  COUPON: "쿠폰",
  CHARACTER_INVITE: "캐릭터 해금",
  XP: "XP",
  ITEM: "아이템",
};

const REWARD_TYPE_STYLES: Record<EndingRewardBasic["type"], string> = {
  COIN: "bg-amber-500/10 text-amber-700",
  COUPON: "bg-sky-500/10 text-sky-700",
  CHARACTER_INVITE: "bg-violet-500/10 text-violet-600",
  XP: "bg-emerald-500/10 text-emerald-700",
  ITEM: "bg-blue-500/10 text-blue-600",
};

interface EndingsTabProps {
  storyId: number;
  episodeId: number;
}

export function EndingsTab({ storyId, episodeId }: EndingsTabProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEnding, setEditingEnding] = useState<EndingWithRewards | null>(null);
  const [addRewardEndingId, setAddRewardEndingId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<EndingRewardBasic["type"]>("CHARACTER_INVITE");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [couponId, setCouponId] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data: endings = [], isLoading } = useQuery<EndingWithRewards[]>({
    queryKey: ["episodes", episodeId, "endings"],
    queryFn: async () => {
      const res = await fetch(`/api/episodes/${episodeId}/endings`);
      if (!res.ok) throw new Error("Failed to fetch endings");
      return res.json();
    },
  });

  const { data: storyCharacters = [] } = useStoryCharacters(storyId);

  const createEnding = useMutation({
    mutationFn: async (data: { key: string; name: string; imageUrl?: string }) => {
      const res = await fetch(`/api/episodes/${episodeId}/endings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create ending");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "endings"] });
      toast.success("엔딩이 추가되었습니다.");
      setIsAddDialogOpen(false);
    },
    onError: () => toast.error("엔딩 추가 실패"),
  });

  const updateEnding = useMutation({
    mutationFn: async ({
      endingId: id,
      data: patch,
    }: {
      endingId: number;
      data: { key?: string; name?: string; imageUrl?: string };
    }) => {
      const res = await fetch(`/api/episodes/${episodeId}/endings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update ending");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "endings"] });
      toast.success("엔딩이 수정되었습니다.");
      setEditingEnding(null);
    },
    onError: () => toast.error("엔딩 수정 실패"),
  });

  const deleteEnding = useMutation({
    mutationFn: async (endingId: number) => {
      const res = await fetch(`/api/episodes/${episodeId}/endings/${endingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete ending");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "endings"] });
      toast.success("엔딩이 삭제되었습니다.");
    },
    onError: () => toast.error("엔딩 삭제 실패"),
  });

  const addReward = useMutation({
    mutationFn: async (endingId: number) => {
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
      const res = await fetch(`/api/episodes/${episodeId}/endings/${endingId}/rewards`, {
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
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "endings"] });
      toast.success("리워드가 추가되었습니다.");
      setAddRewardEndingId(null);
      setSelectedCharacterId("");
      setRewardDescription("");
      setCoinAmount("");
      setXpAmount("");
      setCouponId("");
    },
    onError: () => toast.error("리워드 추가 실패"),
  });

  const deleteReward = useMutation({
    mutationFn: async ({ endingId, rewardId }: { endingId: number; rewardId: number }) => {
      const res = await fetch(
        `/api/episodes/${episodeId}/endings/${endingId}/rewards?id=${rewardId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete reward");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episodeId, "endings"] });
      toast.success("리워드가 삭제되었습니다.");
    },
    onError: () => toast.error("리워드 삭제 실패"),
  });

  const getRewardLabel = (reward: EndingRewardBasic) => {
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

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [addFormKey, setAddFormKey] = useState("");
  const [addFormName, setAddFormName] = useState("");
  const [addFormImageUrl, setAddFormImageUrl] = useState("");

  const handleCreateEnding = () => {
    if (!addFormKey.trim() || !addFormName.trim()) return;
    createEnding.mutate({
      key: addFormKey.trim(),
      name: addFormName.trim(),
      imageUrl: addFormImageUrl || undefined,
    });
    setAddFormKey("");
    setAddFormName("");
    setAddFormImageUrl("");
  };

  return (
    <div className="max-w-2xl">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Endings ({endings.length})
            </CardTitle>
            <Button size="sm" className="rounded-xl" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ending
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
            endings.map((ending) => {
              const isExpanded = expandedIds.has(ending.id);
              return (
                <div
                  key={ending.id}
                  className="rounded-xl bg-secondary/50 border border-border/50 overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {ending.imageUrl ? (
                        <img
                          src={ending.imageUrl}
                          alt={ending.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Trophy className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-muted-foreground">{ending.key}</p>
                      <p className="font-medium text-foreground">{ending.name}</p>
                      {ending.rewards.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          리워드 {ending.rewards.length}개
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-8"
                        onClick={() => setEditingEnding(ending)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-8"
                        onClick={() => setAddRewardEndingId(ending.id)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        리워드
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10"
                        onClick={() => deleteEnding.mutate(ending.id)}
                        disabled={deleteEnding.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {ending.rewards.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl"
                          onClick={() => toggleExpanded(ending.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && ending.rewards.length > 0 && (
                    <div className="border-t border-border/50 p-4 space-y-2 bg-background/30">
                      {ending.rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {reward.type === "CHARACTER_INVITE" ? (
                              <UserPlus className="w-4 h-4 text-primary" />
                            ) : reward.type === "COIN" || reward.type === "XP" ? (
                              <Sparkles className="w-4 h-4 text-primary" />
                            ) : (
                              <Gift className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                REWARD_TYPE_STYLES[reward.type]
                              )}
                            >
                              {REWARD_TYPE_LABELS[reward.type]}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {getRewardLabel(reward)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              deleteReward.mutate({ endingId: ending.id, rewardId: reward.id })
                            }
                            disabled={deleteReward.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          {!isLoading && endings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No endings configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Ending Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>엔딩 추가</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-1">
            <div>
              <Label className="text-xs font-medium">Key</Label>
              <Input
                value={addFormKey}
                onChange={(e) => setAddFormKey(e.target.value)}
                placeholder="ENDING_BADA"
                className="mt-1 rounded-xl bg-secondary border-0 h-9 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Name</Label>
              <Input
                value={addFormName}
                onChange={(e) => setAddFormName(e.target.value)}
                placeholder="Bada 엔딩"
                className="mt-1 rounded-xl bg-secondary border-0 h-9"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">이미지</Label>
              <ImageUploader
                value={addFormImageUrl}
                onChange={setAddFormImageUrl}
                aspectRatio="square"
                maxSizeMB={5}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleCreateEnding}
              disabled={
                createEnding.isPending || !addFormKey.trim() || !addFormName.trim()
              }
            >
              {createEnding.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ending Dialog */}
      <Dialog open={!!editingEnding} onOpenChange={(o) => !o && setEditingEnding(null)}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>엔딩 수정</DialogTitle>
          </DialogHeader>
          {editingEnding && (
            <EditEndingForm
              ending={editingEnding}
              onSave={(data) =>
                updateEnding.mutate({
                  endingId: editingEnding.id,
                  data,
                })
              }
              onClose={() => setEditingEnding(null)}
              saving={updateEnding.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Reward Dialog */}
      <Dialog
        open={addRewardEndingId !== null}
        onOpenChange={(o) => !o && setAddRewardEndingId(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>엔딩 리워드 추가</DialogTitle>
          </DialogHeader>
          {addRewardEndingId && (
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">타입</Label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => {
                    setSelectedType(v as EndingRewardBasic["type"]);
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
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setAddRewardEndingId(null)}
            >
              취소
            </Button>
            {addRewardEndingId && (
              <Button
                className="rounded-xl"
                onClick={() => addReward.mutate(addRewardEndingId)}
                disabled={
                  addReward.isPending ||
                  (selectedType === "CHARACTER_INVITE" && !selectedCharacterId) ||
                  (selectedType === "COIN" && !coinAmount.trim()) ||
                  (selectedType === "XP" && !xpAmount.trim()) ||
                  (selectedType === "COUPON" && !couponId.trim())
                }
              >
                {addReward.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                추가
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditEndingForm({
  ending,
  onSave,
  onClose,
  saving,
}: {
  ending: EndingWithRewards;
  onSave: (data: { key: string; name: string; imageUrl?: string }) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [key, setKey] = useState(ending.key);
  const [name, setName] = useState(ending.name);
  const [imageUrl, setImageUrl] = useState(ending.imageUrl ?? "");

  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4 py-1">
          <div>
            <Label className="text-xs font-medium">Key</Label>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ENDING_BADA"
            className="mt-1 rounded-xl bg-secondary border-0 h-9 font-mono"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bada 엔딩"
            className="mt-1 rounded-xl bg-secondary border-0 h-9"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">이미지</Label>
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            aspectRatio="square"
            maxSizeMB={5}
            className="mt-1"
          />
        </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" className="rounded-xl" onClick={onClose}>
          취소
        </Button>
        <Button
          className="rounded-xl"
          onClick={() => onSave({ key, name, imageUrl: imageUrl || undefined })}
          disabled={saving || !key.trim() || !name.trim()}
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          저장
        </Button>
      </DialogFooter>
    </>
  );
}
