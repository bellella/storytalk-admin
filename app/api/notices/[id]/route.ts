import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NoticeType } from "@/src/generated/prisma/enums";

const NOTICE_TYPES: NoticeType[] = [
  "GENERAL",
  "BETA",
  "EVENT",
  "MAINTENANCE",
  "UPDATE",
];

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notice = await prisma.notice.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!notice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(notice);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nid = parseInt(id, 10);
  const body = await req.json();

  const existing = await prisma.notice.findUnique({ where: { id: nid } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: {
    title?: string;
    content?: string;
    type?: NoticeType;
    isPopup?: boolean;
    isActive?: boolean;
    version?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
  } = {};

  if (body.title !== undefined) {
    const t = String(body.title).trim();
    if (!t) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    data.title = t;
  }
  if (body.content !== undefined) {
    const c = String(body.content);
    if (!c.trim()) return NextResponse.json({ error: "content cannot be empty" }, { status: 400 });
    data.content = c;
  }
  if (body.type !== undefined) {
    if (!NOTICE_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    data.type = body.type;
  }
  if (body.isPopup !== undefined) data.isPopup = Boolean(body.isPopup);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (body.version !== undefined) {
    const v = Number(body.version);
    if (!Number.isInteger(v) || v < 1) {
      return NextResponse.json({ error: "version must be a positive integer" }, { status: 400 });
    }
    data.version = v;
  }
  if ("startsAt" in body) {
    const p = parseOptionalDate(body.startsAt);
    if (p === undefined && body.startsAt !== null && body.startsAt !== "") {
      return NextResponse.json({ error: "invalid startsAt" }, { status: 400 });
    }
    data.startsAt = p === undefined ? undefined : p;
  }
  if ("endsAt" in body) {
    const p = parseOptionalDate(body.endsAt);
    if (p === undefined && body.endsAt !== null && body.endsAt !== "") {
      return NextResponse.json({ error: "invalid endsAt" }, { status: 400 });
    }
    data.endsAt = p === undefined ? undefined : p;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const notice = await prisma.notice.update({
    where: { id: nid },
    data,
  });
  return NextResponse.json(notice);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const nid = parseInt(id, 10);
  const existing = await prisma.notice.findUnique({ where: { id: nid } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.notice.delete({ where: { id: nid } });
  return NextResponse.json({ ok: true });
}

function parseOptionalDate(v: unknown): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const d = new Date(v as string);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}
