import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const episode = await prisma.episode.findUnique({
    where: { id: parseInt((await params).episodeId) },
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
      rewards: true,
      endings: { orderBy: { order: "asc" } },
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
    where: { id: parseInt((await params).episodeId) },
    data: body,
  });
  return NextResponse.json(episode);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  await prisma.episode.delete({
    where: { id: parseInt((await params).episodeId) },
  });
  return NextResponse.json({ ok: true });
}
