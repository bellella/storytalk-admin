import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const progress = await prisma.storyProgress.findMany({
    where: { userId: parseInt(userId) },
    include: {
      story: {
        select: {
          id: true,
          title: true,
          _count: { select: { episodes: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(progress);
}
