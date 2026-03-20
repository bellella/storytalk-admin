import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string; endingId: string }> }
) {
  const { episodeId, endingId } = await params;
  const ending = await prisma.ending.findFirst({
    where: {
      id: parseInt(endingId),
      episodeId: parseInt(episodeId),
    },
    include: { rewards: true },
  });
  if (!ending) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ending.rewards);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; endingId: string }> }
) {
  const { episodeId, endingId } = await params;
  const body = await req.json();
  const { type, payload, isActive } = body;

  if (!type || !payload) {
    return NextResponse.json(
      { error: "type and payload required" },
      { status: 400 }
    );
  }

  const ending = await prisma.ending.findFirst({
    where: {
      id: parseInt(endingId),
      episodeId: parseInt(episodeId),
    },
  });
  if (!ending) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reward = await prisma.endingReward.create({
    data: {
      endingId: parseInt(endingId),
      type,
      payload,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(reward);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; endingId: string }> }
) {
  const { episodeId, endingId } = await params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const reward = await prisma.endingReward.findFirst({
    where: { id: parseInt(id), endingId: parseInt(endingId) },
    include: { ending: true },
  });
  if (!reward || reward.ending.episodeId !== parseInt(episodeId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.endingReward.delete({
    where: { id: parseInt(id) },
  });
  return NextResponse.json({ ok: true });
}
