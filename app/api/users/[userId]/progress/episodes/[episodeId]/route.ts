import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * 해당 유저의 에피소드 진행(UserEpisode), 에피소드 퀴즈 세션,
 * 복습/좋아요/엔딩 도달/XP 로그(해당 에피소드) 등을 삭제합니다.
 */
export async function DELETE(
  _: Request,
  {
    params,
  }: { params: Promise<{ userId: string; episodeId: string }> }
) {
  const { userId: userIdStr, episodeId: episodeIdStr } = await params;
  const userId = parseInt(userIdStr, 10);
  const episodeId = parseInt(episodeIdStr, 10);

  if (Number.isNaN(userId) || Number.isNaN(episodeId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { id: true },
  });
  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const quizSessions = await tx.userQuizSession.findMany({
      where: {
        userId,
        type: "EPISODE",
        sourceId: episodeId,
      },
      select: { id: true },
    });
    const sessionIds = quizSessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      await tx.userQuizAnswer.deleteMany({
        where: { quizSessionId: { in: sessionIds } },
      });
      await tx.quizSessionItem.deleteMany({
        where: { userQuizSessionId: { in: sessionIds } },
      });
      await tx.userQuizSession.deleteMany({
        where: { id: { in: sessionIds } },
      });
    }

    const reviewDeleted = await tx.userReviewItem.deleteMany({
      where: {
        userId,
        reviewItem: { episodeId },
      },
    });

    const likeDeleted = await tx.userEpisodeLike.deleteMany({
      where: { userId, episodeId },
    });

    const endingDeleted = await tx.userEnding.deleteMany({
      where: { userId, episodeId },
    });

    const xpDeleted = await tx.userXpHistory.deleteMany({
      where: {
        userId,
        sourceType: "EPISODE",
        sourceId: episodeId,
      },
    });

    const ueDeleted = await tx.userEpisode.deleteMany({
      where: { userId, episodeId },
    });

    return {
      userEpisodes: ueDeleted.count,
      quizSessions: sessionIds.length,
      userReviewItems: reviewDeleted.count,
      userEpisodeLikes: likeDeleted.count,
      userEndings: endingDeleted.count,
      userXpHistory: xpDeleted.count,
    };
  });

  return NextResponse.json({ ok: true, deleted: result });
}
