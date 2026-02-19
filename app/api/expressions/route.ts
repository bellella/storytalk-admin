import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId");

  if (!characterId) {
    return NextResponse.json(
      { error: "characterId is required" },
      { status: 400 }
    );
  }

  const expressions = await prisma.characterImage.findMany({
    where: { characterId: parseInt(characterId) },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(expressions);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.characterId) {
    return NextResponse.json(
      { error: "characterId is required" },
      { status: 400 }
    );
  }

  const image = await prisma.characterImage.create({
    data: {
      characterId: parseInt(body.characterId),
      imageUrl: body.imageUrl,
      label: body.label || null,
      isDefault: body.isDefault || false,
    },
  });
  return NextResponse.json(image);
}
