import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ userId: string; playEpisodeId: string }> }
) {
  const { userId, playEpisodeId } = await params;
  const uid = parseInt(userId);
  const peId = parseInt(playEpisodeId);
  if (isNaN(uid) || isNaN(peId)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  const existing = await prisma.userPlayEpisode.findFirst({
    where: { id: peId, userId: uid },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.$transaction([
    prisma.playEpisodeSlot.deleteMany({ where: { playEpisodeId: peId } }),
    prisma.userPlayEpisode.update({
      where: { id: peId },
      data: {
        data: undefined,
        lastSceneId: null,
        lastSlotId: null,
      },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
