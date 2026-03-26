import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string; messageId: string }> }
) {
  const { userId, messageId } = await params;
  const uid = parseInt(userId);
  const mid = parseInt(messageId);
  if (isNaN(uid) || isNaN(mid)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const message = await prisma.message.findFirst({
    where: { id: mid, userId: uid },
  });
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const content = body.content;
  if (content === undefined) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const updated = await prisma.message.update({
    where: { id: mid },
    data: { content: String(content) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ userId: string; messageId: string }> }
) {
  const { userId, messageId } = await params;
  const uid = parseInt(userId);
  const mid = parseInt(messageId);
  if (isNaN(uid) || isNaN(mid)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const message = await prisma.message.findFirst({
    where: { id: mid, userId: uid },
  });
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.message.delete({ where: { id: mid } });
  return NextResponse.json({ deleted: 1 });
}
