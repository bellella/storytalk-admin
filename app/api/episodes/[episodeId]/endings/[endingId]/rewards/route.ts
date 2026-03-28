import { prisma } from "@/lib/prisma";
import { rewardEndingToClient } from "@/lib/reward-helpers";
import { NextResponse } from "next/server";
import type { RewardType } from "@/src/generated/prisma/enums";

const REWARD_TYPES: RewardType[] = [
  "COIN",
  "COUPON",
  "CHARACTER_INVITE",
  "XP",
  "ITEM",
];

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
  });
  if (!ending) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rewards = await prisma.reward.findMany({
    where: { sourceType: "ENDING", sourceId: ending.id },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(rewards.map(rewardEndingToClient));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; endingId: string }> }
) {
  const { episodeId, endingId } = await params;
  const body = await req.json();
  const { type, payload, isActive, description } = body;

  const ending = await prisma.ending.findFirst({
    where: {
      id: parseInt(endingId),
      episodeId: parseInt(episodeId),
    },
  });
  if (!ending) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!type || !REWARD_TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  const p = payload !== undefined && payload !== null ? payload : {};
  if (typeof p !== "object") {
    return NextResponse.json({ error: "payload must be a JSON object" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: {
      sourceType: "ENDING",
      sourceId: ending.id,
      type,
      description: description ?? null,
      payload: p as object,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(rewardEndingToClient(reward));
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

  const reward = await prisma.reward.findFirst({
    where: {
      id: parseInt(id),
      sourceType: "ENDING",
      sourceId: parseInt(endingId),
    },
  });
  if (!reward) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ending = await prisma.ending.findFirst({
    where: { id: parseInt(endingId), episodeId: parseInt(episodeId) },
  });
  if (!ending) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reward.delete({
    where: { id: parseInt(id) },
  });
  return NextResponse.json({ ok: true });
}
