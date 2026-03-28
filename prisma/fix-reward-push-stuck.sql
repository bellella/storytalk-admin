-- db push가 중간에 실패해 `UserRewardHistory`만 있고 `Reward`가 없을 때 P1014가 날 수 있음.
-- Supabase SQL Editor에서 한 번 실행한 뒤: npx prisma db push

DROP TABLE IF EXISTS "UserRewardHistory" CASCADE;
