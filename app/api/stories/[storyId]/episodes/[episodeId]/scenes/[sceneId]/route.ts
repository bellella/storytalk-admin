import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const scene = await prisma.scene.findUnique({
    where: { id: parseInt((await params).sceneId) },
    include: {
      dialogues: {
        orderBy: { order: "asc" },
      },
    },
  });
  return NextResponse.json(scene);
}

const SCENE_UPDATE_FIELDS = [
  "type",
  "flowType",
  "branchKey",
  "endingId",
  "title",
  "koreanTitle",
  "bgImageUrl",
  "audioUrl",
  "order",
  "data",
  "status",
] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of SCENE_UPDATE_FIELDS) {
    if (key in body) {
      data[key] = body[key];
    }
  }
  const scene = await prisma.scene.update({
    where: { id: parseInt((await params).sceneId) },
    data,
  });
  return NextResponse.json(scene);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params;
  const id = parseInt(sceneId);
  await prisma.$transaction([
    prisma.dialogue.deleteMany({ where: { sceneId: id } }),
    prisma.scene.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
