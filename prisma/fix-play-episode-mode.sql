-- PlayEpisodeMode enum 재구성 + Episode.playMode 컬럼 추가
-- PostgreSQL은 enum 값 삭제가 불가능하므로 새 타입 생성 후 교체

-- 1. 새 enum 타입 생성
CREATE TYPE "PlayEpisodeMode_new" AS ENUM ('ROLEPLAY', 'ROLEPLAY_WITH_EVAL');

-- 2. UserPlayEpisode.mode 컬럼 마이그레이션 (default 먼저 제거)
ALTER TABLE "UserPlayEpisode"
  ALTER COLUMN "mode" DROP DEFAULT;

ALTER TABLE "UserPlayEpisode"
  ALTER COLUMN "mode" TYPE "PlayEpisodeMode_new"
  USING (
    CASE "mode"::text
      WHEN 'FREE_CHAT'      THEN 'ROLEPLAY'
      WHEN 'CHAT_WITH_EVAL' THEN 'ROLEPLAY_WITH_EVAL'
      WHEN 'CHAT_WITH_QUIZ' THEN 'ROLEPLAY_WITH_EVAL'
      ELSE 'ROLEPLAY'
    END
  )::"PlayEpisodeMode_new";

ALTER TABLE "UserPlayEpisode"
  ALTER COLUMN "mode" SET DEFAULT 'ROLEPLAY'::"PlayEpisodeMode_new";

-- 3. 기존 enum 제거 후 이름 변경
DROP TYPE "PlayEpisodeMode";
ALTER TYPE "PlayEpisodeMode_new" RENAME TO "PlayEpisodeMode";

-- 4. Episode.playMode 컬럼 추가
ALTER TABLE "Episode"
  ADD COLUMN IF NOT EXISTS "playMode" "PlayEpisodeMode";
