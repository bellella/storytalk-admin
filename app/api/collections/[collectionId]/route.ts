import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  const { collectionId } = await params;
  const collection = await prisma.collection.findUnique({
    where: { id: parseInt(collectionId) },
    include: {
      products: {
        orderBy: { order: "asc" },
        include: { product: true },
      },
    },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(collection);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const body = await req.json();
    const collection = await prisma.collection.update({
      where: { id: parseInt(collectionId) },
      data: body,
    });
    return NextResponse.json(collection);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    await prisma.collection.delete({ where: { id: parseInt(collectionId) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
