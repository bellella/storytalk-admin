import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const scenes = await prisma.scene.findMany({
    where: { episodeId: (await params).episodeId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(scenes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const body = await req.json();
  const scene = await prisma.scene.create({
    data: {
      ...body,
      episodeId: (await params).episodeId,
    },
  });
  return NextResponse.json(scene);
}
