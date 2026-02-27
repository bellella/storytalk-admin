import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const rewards = await prisma.episodeReward.findMany({
    where: { episodeId: parseInt(episodeId) },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rewards);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const body = await req.json();
  const { type, payload, isActive } = body;

  if (!type || !payload) {
    return NextResponse.json({ error: "type and payload required" }, { status: 400 });
  }

  const reward = await prisma.episodeReward.create({
    data: {
      episodeId: parseInt(episodeId),
      type,
      payload,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(reward);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.episodeReward.delete({
    where: { id: parseInt(id), episodeId: parseInt(episodeId) },
  });
  return NextResponse.json({ success: true });
}
