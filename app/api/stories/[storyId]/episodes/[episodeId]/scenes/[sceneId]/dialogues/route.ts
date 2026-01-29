import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { sceneId: string } }
) {
  const dialogues = await prisma.dialogue.findMany({
    where: { sceneId: params.sceneId },
    orderBy: { order: "asc" },
    include: {
      character: true,
      expression: true,
    },
  });
  return NextResponse.json(dialogues);
}

export async function POST(
  req: Request,
  { params }: { params: { sceneId: string } }
) {
  const body = await req.json();
  const dialogue = await prisma.dialogue.create({
    data: {
      ...body,
      sceneId: params.sceneId,
    },
  });
  return NextResponse.json(dialogue);
}
