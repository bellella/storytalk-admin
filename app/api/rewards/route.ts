import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { RewardSourceType, RewardType } from "@/src/generated/prisma/enums";

const ADMIN_SOURCES: RewardSourceType[] = ["ATTENDANCE", "SIGNUP"];

const REWARD_TYPES: RewardType[] = [
  "COIN",
  "COUPON",
  "CHARACTER_INVITE",
  "XP",
  "ITEM",
];

function isAdminSource(t: string): t is RewardSourceType {
  return ADMIN_SOURCES.includes(t as RewardSourceType);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sourceType = searchParams.get("sourceType");
  if (!sourceType || !isAdminSource(sourceType)) {
    return NextResponse.json(
      { error: "sourceType must be ATTENDANCE or SIGNUP" },
      { status: 400 }
    );
  }

  const rewards = await prisma.reward.findMany({
    where: { sourceType },
    orderBy: [{ sourceId: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(rewards);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sourceType = body?.sourceType as string | undefined;
  const sourceId = body?.sourceId as number | undefined;
  const type = body?.type as RewardType | undefined;
  const description = body?.description as string | null | undefined;
  const payload = body?.payload;
  const isActive = body?.isActive as boolean | undefined;

  if (!sourceType || !isAdminSource(sourceType)) {
    return NextResponse.json(
      { error: "sourceType must be ATTENDANCE or SIGNUP" },
      { status: 400 }
    );
  }
  if (sourceId === undefined || typeof sourceId !== "number" || !Number.isInteger(sourceId)) {
    return NextResponse.json(
      { error: "sourceId must be an integer (e.g. 0 for default)" },
      { status: 400 }
    );
  }
  if (!type || !REWARD_TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  if (payload !== undefined && payload !== null && typeof payload !== "object") {
    return NextResponse.json({ error: "payload must be a JSON object" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: {
      sourceType,
      sourceId,
      type,
      description: description ?? null,
      payload: (payload ?? {}) as object,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(reward);
}
