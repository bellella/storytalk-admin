import type { Reward } from "@/src/generated/prisma/client";
import type { RewardType } from "@/src/generated/prisma/enums";

/** 엔딩 탭 API: Reward(ENDING) → 기존 EndingRewardBasic 형태 */
export function rewardEndingToClient(r: Reward) {
  return {
    id: r.id,
    endingId: r.sourceId,
    type: r.type as RewardType,
    description: r.description,
    payload: r.payload as Record<string, unknown>,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
