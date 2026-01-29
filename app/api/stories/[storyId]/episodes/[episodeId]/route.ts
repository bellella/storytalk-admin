import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { episodeId: string } }
) {
  const episode = await prisma.episode.findUnique({
    where: { id: params.episodeId },
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
  { params }: { params: { episodeId: string } }
) {
  const body = await req.json();
  const episode = await prisma.episode.update({
    where: { id: params.episodeId },
    data: body,
  });
  return NextResponse.json(episode);
}

export async function DELETE(
  _: Request,
  { params }: { params: { episodeId: string } }
) {
  await prisma.episode.delete({ where: { id: params.episodeId } });
  return NextResponse.json({ ok: true });
}
