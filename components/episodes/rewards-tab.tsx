"use client";

import type { EpisodeRewardBasic } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const rewardTypeLabels: Record<EpisodeRewardBasic["type"], string> = {
  EXP: "경험치",
  CHARACTER_UNLOCK: "캐릭터 해금",
  ITEM: "아이템",
};

const rewardTypeStyles: Record<EpisodeRewardBasic["type"], string> = {
  EXP: "bg-amber-500/10 text-amber-600",
  CHARACTER_UNLOCK: "bg-violet-500/10 text-violet-600",
  ITEM: "bg-blue-500/10 text-blue-600",
};

interface RewardsTabProps {
  rewards: EpisodeRewardBasic[];
}

export function RewardsTab({ rewards }: RewardsTabProps) {
  return (
    <div className="max-w-2xl">
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Episode Rewards ({rewards.length})
            </CardTitle>
            <Button size="sm" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Reward
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">
                    {reward.type}
                  </p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      rewardTypeStyles[reward.type]
                    )}
                  >
                    {rewardTypeLabels[reward.type]}
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
                  {JSON.stringify(reward.payload)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No rewards configured
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
