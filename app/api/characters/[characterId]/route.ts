import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const character = await prisma.character.findUnique({
    where: { id: (await params).characterId },
    include: {
      images: true,
    },
  });
  return NextResponse.json(character);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const body = await req.json();
  const character = await prisma.character.update({
    where: { id: (await params).characterId },
    data: body,
  });
  return NextResponse.json(character);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  await prisma.character.delete({ where: { id: (await params).characterId } });
  return NextResponse.json({ ok: true });
}
