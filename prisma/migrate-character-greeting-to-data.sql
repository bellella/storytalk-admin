-- Run once before/while applying schema that removes Character.greetingMessage.
-- Maps legacy string column into data.greetingMessage { englishText, koreanText }.

ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "data" JSONB;

UPDATE "Character"
SET
  "data" = COALESCE("data"::jsonb, '{}'::jsonb)
    || jsonb_build_object(
      'greetingMessage',
      jsonb_build_object(
        'englishText',
        COALESCE(NULLIF(TRIM("greetingMessage"), ''), ''),
        'koreanText',
        ''
      )
    )
WHERE "greetingMessage" IS NOT NULL
  AND TRIM("greetingMessage") <> '';

-- After this, apply Prisma schema without greetingMessage (db push / migrate).
