import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const levels = await prisma.xpLevel.findMany({
    orderBy: { requiredTotalXp: "asc" },
  });
  return NextResponse.json(levels);
}

export async function POST(req: Request) {
  const body = await req.json();

  const level = await prisma.xpLevel.create({
    data: {
      level: Number(body.level),
      requiredTotalXp: Number(body.requiredTotalXp),
      title: body.title ?? null,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(level);
}

