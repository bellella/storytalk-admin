import { prisma } from "@/lib/prisma";
import { rewardEpisodeToClient } from "@/lib/reward-helpers";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const episodeId = parseInt((await params).episodeId, 10);
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      scenes: {
        orderBy: { order: "asc" },
        include: {
          dialogues: {
            orderBy: { order: "asc" },
            include: {
              character: true,
            },
          },
        },
      },
      endings: { orderBy: { order: "asc" } },
    },
  });
  if (!episode) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rewardRows = await prisma.reward.findMany({
    where: { sourceType: "EPISODE", sourceId: episodeId },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    ...episode,
    rewards: rewardRows.map(rewardEpisodeToClient),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const body = await req.json();
  const episode = await prisma.episode.update({
    where: { id: parseInt((await params).episodeId) },
    data: body,
  });
  return NextResponse.json(episode);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ storyId: string; episodeId: string }> }
) {
  const { storyId: storyIdParam, episodeId: episodeIdParam } = await params;
  const storyId = parseInt(storyIdParam, 10);
  const episodeId = parseInt(episodeIdParam, 10);

  const exists = await prisma.episode.findFirst({
    where: { id: episodeId, storyId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.episode.delete({ where: { id: episodeId } });

  // 남은 에피소드 order를 1..n으로 다시 맞춤 (UI 배지·정렬과 일치)
  const remaining = await prisma.episode.findMany({
    where: { storyId },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  if (remaining.length > 0) {
    await prisma.$transaction(async (tx) => {
      const tempBase = 1_000_000;
      for (let i = 0; i < remaining.length; i++) {
        await tx.episode.update({
          where: { id: remaining[i].id },
          data: { order: tempBase + i },
        });
      }
      for (let i = 0; i < remaining.length; i++) {
        await tx.episode.update({
          where: { id: remaining[i].id },
          data: { order: i + 1 },
        });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
