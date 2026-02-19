import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const story = await prisma.story.findUnique({
    where: { id: parseInt((await params).storyId) },
    include: {
      episodes: {
        orderBy: { order: "asc" },
      },
      storyTags: {
        include: { tag: true },
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
    where: { id: parseInt((await params).storyId) },
    data: body,
  });
  return NextResponse.json(story);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  await prisma.story.delete({
    where: { id: parseInt((await params).storyId) },
  });
  return NextResponse.json({ ok: true });
}
