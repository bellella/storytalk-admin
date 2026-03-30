import { prisma } from "@/lib/prisma";
import { rewardEpisodeToClient } from "@/lib/reward-helpers";
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
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const eid = parseInt(episodeId, 10);
  const episode = await prisma.episode.findUnique({ where: { id: eid } });
  if (!episode) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rewards = await prisma.reward.findMany({
    where: { sourceType: "EPISODE", sourceId: eid },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(rewards.map(rewardEpisodeToClient));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const eid = parseInt(episodeId, 10);
  const episode = await prisma.episode.findUnique({ where: { id: eid } });
  if (!episode) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { type, payload, isActive, description } = body;

  if (!type || !REWARD_TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  const p = payload !== undefined && payload !== null ? payload : {};
  if (typeof p !== "object") {
    return NextResponse.json({ error: "payload must be a JSON object" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: {
      sourceType: "EPISODE",
      sourceId: eid,
      type,
      description: description ?? null,
      payload: p as object,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(rewardEpisodeToClient(reward));
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const eid = parseInt(episodeId, 10);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const reward = await prisma.reward.findFirst({
    where: {
      id: parseInt(id, 10),
      sourceType: "EPISODE",
      sourceId: eid,
    },
  });
  if (!reward) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reward.delete({
    where: { id: parseInt(id, 10) },
  });
  return NextResponse.json({ ok: true });
}
