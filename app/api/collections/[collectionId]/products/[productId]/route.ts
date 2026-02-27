import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE: 컬렉션에서 상품 제거
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ collectionId: string; productId: string }> }
) {
  try {
    const { collectionId, productId } = await params;
    await prisma.collectionProduct.deleteMany({
      where: {
        collectionId: parseInt(collectionId),
        productId: parseInt(productId),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
