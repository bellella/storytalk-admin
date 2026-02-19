import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const storyTags = await prisma.storyTag.findMany({
    where: { storyId: parseInt(storyId) },
    include: { tag: true },
  });
  return NextResponse.json(storyTags);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const body = await req.json();

  const storyTag = await prisma.storyTag.create({
    data: {
      storyId: parseInt(storyId),
      tagId: parseInt(body.tagId),
    },
    include: { tag: true },
  });

  return NextResponse.json(storyTag);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const { searchParams } = new URL(req.url);
  const tagId = searchParams.get("tagId");

  if (!tagId) {
    return NextResponse.json(
      { error: "tagId is required" },
      { status: 400 }
    );
  }

  await prisma.storyTag.delete({
    where: {
      storyId_tagId: {
        storyId: parseInt(storyId),
        tagId: parseInt(tagId),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
