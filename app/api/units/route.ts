import { prisma } from "@/lib/prisma";
import { PublishStatus } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      include: {
        story: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(units);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const maxOrder = await prisma.unit.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const unit = await prisma.unit.create({
      data: {
        storyId: body.storyId,
        order: body.order ?? nextOrder,
        color: body.color,
        status: body.status || PublishStatus.DRAFT,
      },
      include: {
        story: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    return NextResponse.json(unit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
