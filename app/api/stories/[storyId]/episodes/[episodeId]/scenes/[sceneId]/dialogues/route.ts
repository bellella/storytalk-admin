import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const dialogues = await prisma.dialogue.findMany({
    where: { sceneId: (await params).sceneId },
    orderBy: { order: "asc" },
    include: {
      character: true,
    },
  });
  return NextResponse.json(dialogues);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const body = await req.json();
  const dialogue = await prisma.dialogue.create({
    data: {
      ...body,
      sceneId: (await params).sceneId,
      characterId: body.characterId,
    },
  });
  return NextResponse.json(dialogue);
}
