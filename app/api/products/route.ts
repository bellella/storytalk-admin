import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const isActive = searchParams.get("isActive");
  const search = searchParams.get("search");

  const products = await prisma.product.findMany({
    where: {
      ...(type && type !== "ALL" && { type: type as "PLAY_EPISODE" | "COIN_PACK" | "SUBSCRIPTION" }),
      ...(isActive !== null && isActive !== "" && { isActive: isActive === "true" }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { storeSku: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
