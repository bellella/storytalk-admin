import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { characterId: string } }
) {
  const expressions = await prisma.characterImage.findMany({
    where: { characterId: params.characterId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(expressions);
}

export async function POST(
  req: Request,
  { params }: { params: { characterId: string } }
) {
  const body = await req.json();
  const image = await prisma.characterImage.create({
    data: {
      ...body,
      characterId: params.characterId,
    },
  });
  return NextResponse.json(image);
}
