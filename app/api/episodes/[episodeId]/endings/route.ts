import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const endings = await prisma.ending.findMany({
    where: { episodeId: parseInt(episodeId) },
    include: { rewards: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(endings);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const body = await req.json();
  const { key, name, imageUrl, order } = body;

  if (!key || !name) {
    return NextResponse.json(
      { error: "key and name required" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.ending.aggregate({
    where: { episodeId: parseInt(episodeId) },
    _max: { order: true },
  });
  const nextOrder = order ?? (maxOrder._max.order ?? 0) + 1;

  const ending = await prisma.ending.create({
    data: {
      episodeId: parseInt(episodeId),
      key,
      name,
      imageUrl: imageUrl ?? null,
      order: nextOrder,
    },
  });
  return NextResponse.json(ending);
}
