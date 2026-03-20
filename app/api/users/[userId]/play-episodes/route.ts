import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const playEpisodes = await prisma.userPlayEpisode.findMany({
    where: { userId: parseInt(userId) },
    include: {
      episode: {
        select: {
          id: true,
          title: true,
          koreanTitle: true,
          order: true,
          thumbnailUrl: true,
          type: true,
          story: { select: { id: true, title: true } },
        },
      },
      ending: {
        select: { id: true, key: true, name: true },
      },
      slots: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(playEpisodes);
}
