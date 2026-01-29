import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { storyId: string } }
) {
  const story = await prisma.story.findUnique({
    where: { id: params.storyId },
    include: {
      episodes: {
        orderBy: { order: "asc" },
      },
    },
  });
  return NextResponse.json(story);
}

export async function PATCH(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  const body = await req.json();
  const story = await prisma.story.update({
    where: { id: params.storyId },
    data: body,
  });
  return NextResponse.json(story);
}

export async function DELETE(
  _: Request,
  { params }: { params: { storyId: string } }
) {
  await prisma.story.delete({ where: { id: params.storyId } });
  return NextResponse.json({ ok: true });
}
