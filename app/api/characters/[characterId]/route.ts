import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { characterId: string } }
) {
  const character = await prisma.character.findUnique({
    where: { id: params.characterId },
    include: {
      images: true,
    },
  });
  return NextResponse.json(character);
}

export async function PATCH(
  req: Request,
  { params }: { params: { characterId: string } }
) {
  const body = await req.json();
  const character = await prisma.character.update({
    where: { id: params.characterId },
    data: body,
  });
  return NextResponse.json(character);
}

export async function DELETE(
  _: Request,
  { params }: { params: { characterId: string } }
) {
  await prisma.character.delete({ where: { id: params.characterId } });
  return NextResponse.json({ ok: true });
}
