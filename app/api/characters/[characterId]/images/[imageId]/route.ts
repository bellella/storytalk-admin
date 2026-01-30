import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ characterId: string; imageId: string }> }
) {
  const { imageId } = await params;
  const image = await prisma.characterImage.findUnique({
    where: { id: imageId },
  });
  return NextResponse.json(image);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ characterId: string; imageId: string }> }
) {
  const { imageId } = await params;
  const body = await req.json();

  const image = await prisma.characterImage.update({
    where: { id: imageId },
    data: {
      imageUrl: body.imageUrl,
      label: body.label,
      isDefault: body.isDefault,
    },
  });

  return NextResponse.json(image);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ characterId: string; imageId: string }> }
) {
  const { imageId } = await params;
  await prisma.characterImage.delete({
    where: { id: imageId },
  });
  return NextResponse.json({ ok: true });
}
