import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: 컬렉션에 상품 추가
export async function POST(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const { productId } = await req.json();
    const maxOrder = await prisma.collectionProduct.aggregate({
      where: { collectionId: parseInt(collectionId) },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const item = await prisma.collectionProduct.create({
      data: {
        collectionId: parseInt(collectionId),
        productId: parseInt(productId),
        order: nextOrder,
      },
      include: { product: true },
    });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: 컬렉션 내 상품 순서 일괄 업데이트
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    await params; // consume params
    const { items } = await req.json(); // [{ id: number; order: number }]
    await prisma.$transaction(
      items.map(({ id, order }: { id: number; order: number }) =>
        prisma.collectionProduct.update({ where: { id }, data: { order } })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
