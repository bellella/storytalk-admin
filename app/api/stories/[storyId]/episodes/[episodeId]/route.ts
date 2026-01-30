import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const episode = await prisma.episode.findUnique({
    where: { id: (await params).episodeId },
    include: {
      scenes: {
        orderBy: { order: "asc" },
      },
      rewards: true,
    },
  });
  return NextResponse.json(episode);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const body = await req.json();
  const episode = await prisma.episode.update({
    where: { id: (await params).episodeId },
    data: body,
  });
  return NextResponse.json(episode);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  await prisma.episode.delete({ where: { id: (await params).episodeId } });
  return NextResponse.json({ ok: true });
}
