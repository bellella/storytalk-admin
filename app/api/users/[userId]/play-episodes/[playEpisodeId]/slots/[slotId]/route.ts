import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _: Request,
  {
    params,
  }: { params: Promise<{ userId: string; playEpisodeId: string; slotId: string }> }
) {
  const { userId, playEpisodeId, slotId } = await params;
  const uid = parseInt(userId);
  const peId = parseInt(playEpisodeId);
  const sId = parseInt(slotId);
  if (isNaN(uid) || isNaN(peId) || isNaN(sId)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  const slot = await prisma.playEpisodeSlot.findFirst({
    where: { id: sId, playEpisodeId: peId },
    include: { playEpisode: { select: { userId: true } } },
  });
  if (!slot || slot.playEpisode.userId !== uid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.playEpisodeSlot.delete({ where: { id: sId } });
  return NextResponse.json({ deleted: 1 });
}
