import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: episode ↔ product 연결
export async function POST(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { episodeId } = await req.json();
    const link = await prisma.episodeProduct.create({
      data: {
        productId: parseInt(productId),
        episodeId: parseInt(episodeId),
      },
    });
    return NextResponse.json(link);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: 연결 해제
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { episodeId } = await req.json();
    await prisma.episodeProduct.deleteMany({
      where: {
        productId: parseInt(productId),
        episodeId: parseInt(episodeId),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
