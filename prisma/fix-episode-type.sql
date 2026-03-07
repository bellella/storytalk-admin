-- Fix Episode type: change STORY, PREMIUM, EVENT (or any invalid values) to NOVEL
-- Run BEFORE: npx prisma db push
--
-- Step 1: npx prisma db execute --stdin <<< "ALTER TYPE \"EpisodeType\" ADD VALUE IF NOT EXISTS 'NOVEL';"
-- Step 2: npx prisma db execute --file prisma/fix-episode-type.sql

UPDATE "Episode"
SET type = 'NOVEL'::"EpisodeType"
WHERE type::text NOT IN ('NOVEL', 'PLAY');
