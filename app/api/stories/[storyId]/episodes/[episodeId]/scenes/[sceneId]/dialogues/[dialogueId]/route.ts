import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  const dialogue = await prisma.dialogue.findUnique({
    where: { id: (await params).dialogueId },
    include: {
      character: true,
    },
  });
  return NextResponse.json(dialogue);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  const body = await req.json();
  const dialogue = await prisma.dialogue.update({
    where: { id: (await params).dialogueId },
    data: body,
  });
  return NextResponse.json(dialogue);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  await prisma.dialogue.delete({ where: { id: (await params).dialogueId } });
  return NextResponse.json({ ok: true });
}
