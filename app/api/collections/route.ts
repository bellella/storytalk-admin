import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const collections = await prisma.collection.findMany({
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { order: "asc" },
        include: { product: true },
      },
    },
    orderBy: [{ key: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const maxOrder = await prisma.collection.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const collection = await prisma.collection.create({
      data: { ...body, order: body.order ?? nextOrder },
    });
    return NextResponse.json(collection);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
