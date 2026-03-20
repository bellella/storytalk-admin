import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const character = await prisma.character.findUnique({
    where: { id: parseInt((await params).characterId) },
    include: {
      images: true,
    },
  });
  return NextResponse.json(character);
}

const ALLOWED_FIELDS = [
  "name",
  "avatarImage",
  "mainImage",
  "description",
  "personality",
  "chatPrompt",
  "playEpisodePrompt",
  "greetingMessage",
  "isUserSelectable",
  "minUserLevel",
] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      if (key === "minUserLevel" && body[key] != null) {
        data[key] =
          typeof body[key] === "number"
            ? body[key]
            : parseInt(String(body[key]), 10) || 1;
      } else {
        data[key] = body[key];
      }
    }
  }
  const character = await prisma.character.update({
    where: { id: parseInt((await params).characterId) },
    data,
  });
  return NextResponse.json(character);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  await prisma.character.delete({
    where: { id: parseInt((await params).characterId) },
  });
  return NextResponse.json({ ok: true });
}
