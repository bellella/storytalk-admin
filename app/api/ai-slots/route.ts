import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get("storyId");
  const search = searchParams.get("search");

  const dialogues = await prisma.dialogue.findMany({
    where: {
      type: { in: ["AI_INPUT_SLOT", "AI_SLOT"] },
      scene: {
        episode: {
          ...(storyId ? { storyId: parseInt(storyId) } : {}),
        },
      },
      ...(search
        ? {
            OR: [
              { englishText: { contains: search, mode: "insensitive" } },
              { koreanText: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      scene: {
        select: {
          id: true,
          title: true,
          order: true,
          episode: {
            select: {
              id: true,
              title: true,
              order: true,
              storyId: true,
              story: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(dialogues);
}
