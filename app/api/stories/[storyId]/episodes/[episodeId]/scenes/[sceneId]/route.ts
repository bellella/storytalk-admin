import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { sceneId: string } }
) {
  const scene = await prisma.scene.findUnique({
    where: { id: params.sceneId },
    include: {
      dialogues: {
        orderBy: { order: "asc" },
      },
    },
  });
  return NextResponse.json(scene);
}

export async function PATCH(
  req: Request,
  { params }: { params: { sceneId: string } }
) {
  const body = await req.json();
  const scene = await prisma.scene.update({
    where: { id: params.sceneId },
    data: body,
  });
  return NextResponse.json(scene);
}

export async function DELETE(
  _: Request,
  { params }: { params: { sceneId: string } }
) {
  await prisma.scene.delete({ where: { id: params.sceneId } });
  return NextResponse.json({ ok: true });
}
