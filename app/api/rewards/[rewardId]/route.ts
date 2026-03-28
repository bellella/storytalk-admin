import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { RewardType } from "@/src/generated/prisma/enums";

const ADMIN_SOURCES = ["ATTENDANCE", "SIGNUP"] as const;

const REWARD_TYPES: RewardType[] = [
  "COIN",
  "COUPON",
  "CHARACTER_INVITE",
  "XP",
  "ITEM",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const { rewardId } = await params;
  const id = parseInt(rewardId, 10);
  const body = await req.json();

  const existing = await prisma.reward.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!ADMIN_SOURCES.includes(existing.sourceType as (typeof ADMIN_SOURCES)[number])) {
    return NextResponse.json(
      { error: "This reward is managed elsewhere" },
      { status: 403 }
    );
  }

  const data: {
    sourceId?: number;
    type?: RewardType;
    description?: string | null;
    payload?: object;
    isActive?: boolean;
  } = {};

  if (body.sourceId !== undefined) {
    if (typeof body.sourceId !== "number" || !Number.isInteger(body.sourceId)) {
      return NextResponse.json({ error: "sourceId must be an integer" }, { status: 400 });
    }
    data.sourceId = body.sourceId;
  }
  if (body.type !== undefined) {
    if (!REWARD_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    data.type = body.type;
  }
  if (body.description !== undefined) {
    data.description = body.description === null ? null : String(body.description);
  }
  if (body.payload !== undefined) {
    if (body.payload !== null && typeof body.payload !== "object") {
      return NextResponse.json({ error: "payload must be a JSON object" }, { status: 400 });
    }
    data.payload = (body.payload ?? {}) as object;
  }
  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const reward = await prisma.reward.update({
    where: { id },
    data,
  });
  return NextResponse.json(reward);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const { rewardId } = await params;
  const id = parseInt(rewardId, 10);

  const existing = await prisma.reward.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!ADMIN_SOURCES.includes(existing.sourceType as (typeof ADMIN_SOURCES)[number])) {
    return NextResponse.json(
      { error: "This reward is managed elsewhere" },
      { status: 403 }
    );
  }

  await prisma.reward.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
