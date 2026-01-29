import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { dialogueId: string } }
) {
  const dialogue = await prisma.dialogue.findUnique({
    where: { id: params.dialogueId },
    include: {
      character: true,
      expression: true,
    },
  });
  return NextResponse.json(dialogue);
}

export async function PATCH(
  req: Request,
  { params }: { params: { dialogueId: string } }
) {
  const body = await req.json();
  const dialogue = await prisma.dialogue.update({
    where: { id: params.dialogueId },
    data: body,
  });
  return NextResponse.json(dialogue);
}

export async function DELETE(
  _: Request,
  { params }: { params: { dialogueId: string } }
) {
  await prisma.dialogue.delete({ where: { id: params.dialogueId } });
  return NextResponse.json({ ok: true });
}
