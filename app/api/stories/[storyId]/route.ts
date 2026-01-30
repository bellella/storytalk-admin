import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const story = await prisma.story.findUnique({
    where: { id: (await params).storyId },
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
  { params }: { params: Promise<{ storyId: string }> }
) {
  const body = await req.json();
  const story = await prisma.story.update({
    where: { id: (await params).storyId },
    data: body,
  });
  return NextResponse.json(story);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  await prisma.story.delete({ where: { id: (await params).storyId } });
  return NextResponse.json({ ok: true });
}
