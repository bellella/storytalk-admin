import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; endingId: string }> }
) {
  const { episodeId, endingId } = await params;
  const body = await req.json();
  const { key, name, imageUrl, order } = body;

  const data: Record<string, unknown> = {};
  if (key !== undefined) data.key = key;
  if (name !== undefined) data.name = name;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (order !== undefined) data.order = order;

  const ending = await prisma.ending.update({
    where: {
      id: parseInt(endingId),
      episodeId: parseInt(episodeId),
    },
    data,
  });
  return NextResponse.json(ending);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ episodeId: string; endingId: string }> }
) {
  const { episodeId, endingId } = await params;
  await prisma.ending.delete({
    where: {
      id: parseInt(endingId),
      episodeId: parseInt(episodeId),
    },
  });
  return NextResponse.json({ ok: true });
}
