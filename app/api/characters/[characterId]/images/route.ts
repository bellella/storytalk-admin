import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const images = await prisma.characterImage.findMany({
    where: { characterId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(images);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const body = await req.json();

  const image = await prisma.characterImage.create({
    data: {
      characterId,
      imageUrl: body.imageUrl,
      label: body.label || null,
      isDefault: body.isDefault ?? false,
    },
  });

  return NextResponse.json(image);
}
