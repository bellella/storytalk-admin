-- One-time: copy EpisodeReward rows into unified Reward (sourceType=EPISODE, sourceId=episodeId).
-- Run against the DB while EpisodeReward still exists, then apply Prisma schema without EpisodeReward.
-- Safe to run once; re-running duplicates rows unless EpisodeReward was already emptied.

BEGIN;

INSERT INTO "Reward" ("sourceType", "sourceId", "type", "description", "payload", "isActive", "createdAt", "updatedAt")
SELECT
  'EPISODE'::"RewardSourceType",
  er."episodeId",
  er."type",
  NULL,
  er."payload",
  er."isActive",
  er."createdAt",
  er."updatedAt"
FROM "EpisodeReward" er;

DROP TABLE "EpisodeReward";

COMMIT;
