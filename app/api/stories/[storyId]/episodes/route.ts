import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const episodes = await prisma.episode.findMany({
    where: { storyId: parseInt((await params).storyId) },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(episodes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const body = await req.json();
  const episode = await prisma.episode.create({
    data: {
      ...body,
      storyId: parseInt((await params).storyId),
    },
  });
  return NextResponse.json(episode);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const body = await req.json();
  const storyId = parseInt((await params).storyId);
  const rawIds = body.episodeIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return NextResponse.json(
      { error: "episodeIds array required" },
      { status: 400 }
    );
  }

  const episodeIds = rawIds.map((id: unknown) =>
    typeof id === "number" ? id : parseInt(String(id), 10)
  );

  const existing = await prisma.episode.findMany({
    where: { id: { in: episodeIds }, storyId },
  });
  if (existing.length !== episodeIds.length) {
    return NextResponse.json(
      { error: "Some episode IDs not found or belong to another story" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    const tempBase = 1000000;
    for (let i = 0; i < episodeIds.length; i++) {
      await tx.episode.update({
        where: { id: episodeIds[i] },
        data: { order: tempBase + i },
      });
    }
    for (let i = 0; i < episodeIds.length; i++) {
      await tx.episode.update({
        where: { id: episodeIds[i] },
        data: { order: i + 1 },
      });
    }
  });

  const episodes = await prisma.episode.findMany({
    where: { storyId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(episodes);
}
