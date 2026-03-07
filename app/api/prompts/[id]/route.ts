import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prompt = await prisma.promptTemplate.findUnique({
    where: { id: parseInt((await params).id) },
  });
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(prompt);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const prompt = await prisma.promptTemplate.update({
    where: { id: parseInt((await params).id) },
    data: body,
  });
  return NextResponse.json(prompt);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await prisma.promptTemplate.delete({
    where: { id: parseInt((await params).id) },
  });
  return NextResponse.json({ ok: true });
}
