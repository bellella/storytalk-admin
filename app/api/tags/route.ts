import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { slug: "asc" },
  });
  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tag = await prisma.tag.create({
    data: {
      slug: body.slug,
      color: body.color ?? null,
      icon: body.icon ?? null,
    },
  });
  return NextResponse.json(tag);
}
