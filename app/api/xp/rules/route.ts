import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rules = await prisma.xpRule.findMany({
    orderBy: [{ triggerType: "asc" }, { priority: "desc" }],
  });
  return NextResponse.json(rules);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rule = await prisma.xpRule.create({
    data: {
      triggerType: body.triggerType,
      xpAmount: Number(body.xpAmount),
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      priority:
        body.priority !== undefined ? Number(body.priority) : undefined,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(rule);
}

