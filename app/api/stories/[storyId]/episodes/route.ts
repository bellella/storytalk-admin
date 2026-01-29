import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { storyId: string } }
) {
  const episodes = await prisma.episode.findMany({
    where: { storyId: params.storyId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(episodes);
}

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  const body = await req.json();
  const episode = await prisma.episode.create({
    data: {
      ...body,
      storyId: params.storyId,
    },
  });
  return NextResponse.json(episode);
}
