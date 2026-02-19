import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;
    const unit = await prisma.unit.findUnique({
      where: { id: parseInt(unitId) },
      include: {
        story: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;
    const body = await req.json();

    const unit = await prisma.unit.update({
      where: { id: parseInt(unitId) },
      data: {
        storyId: body.storyId,
        order: body.order,
        color: body.color,
        status: body.status,
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

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;

    await prisma.unit.delete({
      where: { id: parseInt(unitId) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
