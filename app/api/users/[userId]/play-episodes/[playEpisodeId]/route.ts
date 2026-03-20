import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string; playEpisodeId: string }> }
) {
  const { userId, playEpisodeId } = await params;
  const uid = parseInt(userId);
  const peId = parseInt(playEpisodeId);
  if (isNaN(uid) || isNaN(peId)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  const body = await req.json();
  if (body.data === undefined) {
    return NextResponse.json({ error: "data required" }, { status: 400 });
  }
  const existing = await prisma.userPlayEpisode.findFirst({
    where: { id: peId, userId: uid },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await prisma.userPlayEpisode.update({
    where: { id: peId },
    data: { data: body.data },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ userId: string; playEpisodeId: string }> }
) {
  const { userId, playEpisodeId } = await params;
  const uid = parseInt(userId);
  const peId = parseInt(playEpisodeId);
  if (isNaN(uid) || isNaN(peId)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  const deleted = await prisma.userPlayEpisode.deleteMany({
    where: { id: peId, userId: uid },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: 1 });
}
