import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const stickers = await prisma.sticker.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(stickers);
}

export async function POST(req: Request) {
  const body = await req.json();
  const sticker = await prisma.sticker.create({ data: body });
  return NextResponse.json(sticker);
}
