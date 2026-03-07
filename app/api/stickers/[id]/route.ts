import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const sticker = await prisma.sticker.update({
    where: { id: parseInt((await params).id) },
    data: body,
  });
  return NextResponse.json(sticker);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await prisma.sticker.delete({
    where: { id: parseInt((await params).id) },
  });
  return NextResponse.json({ ok: true });
}
