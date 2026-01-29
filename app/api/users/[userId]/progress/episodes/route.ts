import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  const progress = await prisma.episodeProgress.findMany({
    where: { userId: params.userId },
    include: {
      episode: true,
    },
  });
  return NextResponse.json(progress);
}
