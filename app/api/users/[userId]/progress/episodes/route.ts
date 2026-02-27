import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const episodes = await prisma.userEpisode.findMany({
    where: { userId: parseInt(userId) },
    include: {
      episode: {
        select: {
          id: true,
          title: true,
          order: true,
          story: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(episodes);
}
