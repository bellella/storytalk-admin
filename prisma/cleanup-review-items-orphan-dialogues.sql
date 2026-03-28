-- prisma db push / migrate 전에 한 번 실행하세요.
-- 존재하지 않는 FK 대상을 가리키는 행이 있으면 AddForeignKey 단계에서 실패합니다.

-- 1) ReviewItem.dialogueId → Dialogue, episodeId → Episode FK
-- UserReviewItem은 ReviewItem 삭제 시 CASCADE로 함께 정리됩니다.
DELETE FROM "ReviewItem" ri
WHERE NOT EXISTS (
  SELECT 1 FROM "Dialogue" d WHERE d.id = ri."dialogueId"
)
OR NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = ri."episodeId"
);

-- 2) EpisodeReward.episodeId → Episode FK
DELETE FROM "EpisodeReward" er
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = er."episodeId"
);

-- 3) episodeId → Episode (db push 시 AddForeignKey 순서마다 막히지 않도록 일괄 정리)
DELETE FROM "UserEpisodeLike" uel
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = uel."episodeId"
);

DELETE FROM "UserEpisode" ue
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = ue."episodeId"
);

DELETE FROM "UserEnding" uen
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = uen."episodeId"
);

DELETE FROM "UserPlayEpisode" upe
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = upe."episodeId"
);

DELETE FROM "EpisodeProduct" ep
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = ep."episodeId"
);

DELETE FROM "Ending" en
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = en."episodeId"
);

DELETE FROM "Scene" s
WHERE NOT EXISTS (
  SELECT 1 FROM "Episode" e WHERE e.id = s."episodeId"
);
