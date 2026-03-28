-- EndingReward 제거 전에 한 번 실행 (Supabase SQL Editor).
-- Reward 테이블이 이미 있어야 함.

INSERT INTO "Reward" ("sourceType", "sourceId", "type", "description", "payload", "isActive", "createdAt", "updatedAt")
SELECT
  'ENDING'::"RewardSourceType",
  er."endingId",
  er.type,
  NULL,
  er.payload,
  er."isActive",
  er."createdAt",
  er."updatedAt"
FROM "EndingReward" er;

DROP TABLE IF EXISTS "EndingReward";
