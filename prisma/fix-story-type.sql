-- Fix Story type: change PREMIUM (or invalid values) to NOVEL
-- Run BEFORE: npx prisma db push
--
-- Step 1: npx prisma db execute --stdin <<< "ALTER TYPE \"StoryType\" ADD VALUE IF NOT EXISTS 'NOVEL';"
-- Step 2: npx prisma db execute --file prisma/fix-story-type.sql

UPDATE "Story"
SET type = 'NOVEL'::"StoryType"
WHERE type::text NOT IN ('UNIT', 'NOVEL', 'PLAY');
