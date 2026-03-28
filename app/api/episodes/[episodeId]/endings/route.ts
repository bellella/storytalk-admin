import { prisma } from "@/lib/prisma";
import { rewardEndingToClient } from "@/lib/reward-helpers";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;
  const eid = parseInt(episodeId);
  const endings = await prisma.ending.findMany({
    where: { episodeId: eid },
    orderBy: { order: "asc" },
  });
  if (endings.length === 0) {
    return NextResponse.json([]);
  }
  const endingIds = endings.map((e) => e.id);
  const rewards = await prisma.reward.findMany({
    where: {
      sourceType: "ENDING",
      sourceId: { in: endingIds },
    },
    orderBy: { id: "asc" },
  });
  const byEnding = new Map<number, typeof rewards>();
  for (const r of rewards) {
    const list = byEnding.get(r.sourceId) ?? [];
    list.push(r);
    byEnding.set(r.sourceId, list);
  }
  const out = endings.map((e) => ({
    ...e,
    rewards: (byEnding.get(e.id) ?? []).map(rewardEndingToClient),
  }));
  return NextResponse.json(out);
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
