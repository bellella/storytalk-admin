import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
    include: {
      episodes: {
        include: {
          episode: {
            select: {
              id: true,
              title: true,
              koreanTitle: true,
              storyId: true,
              order: true,
              status: true,
              story: { select: { id: true, title: true } },
            },
          },
        },
      },
      _count: { select: { purchases: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: body,
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    await prisma.product.delete({ where: { id: parseInt(productId) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
