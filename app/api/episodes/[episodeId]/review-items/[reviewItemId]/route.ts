import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; reviewItemId: string }> }
) {
  try {
    const { reviewItemId } = await params;
    const body = await req.json();

    const reviewItem = await prisma.reviewItem.update({
      where: { id: parseInt(reviewItemId) },
      data: {
        description: body.description,
        order: body.order,
      },
    });

    return NextResponse.json(reviewItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; reviewItemId: string }> }
) {
  try {
    const { reviewItemId } = await params;

    await prisma.reviewItem.delete({
      where: { id: parseInt(reviewItemId) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
