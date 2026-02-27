import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 전체 에피소드 목록 (상품 연결 picker용)
// episodeProducts 포함해서 어느 에피소드가 이미 연결됐는지 표시
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get("storyId");
  const search = searchParams.get("search");

  const episodes = await prisma.episode.findMany({
    where: {
      ...(storyId && { storyId: parseInt(storyId) }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { koreanTitle: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      title: true,
      koreanTitle: true,
      order: true,
      status: true,
      storyId: true,
      story: { select: { id: true, title: true } },
      episodeProducts: {
        select: {
          id: true,
          productId: true,
          product: { select: { id: true, name: true, type: true, isActive: true } },
        },
      },
    },
    orderBy: [{ storyId: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(episodes);
}
