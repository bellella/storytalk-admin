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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("activeOnly") === "1" || searchParams.get("activeOnly") === "true";
  const search = searchParams.get("search")?.trim() ?? "";

  const notices = await prisma.notice.findMany({
    where: {
      ...(activeOnly ? { isActive: true } : {}),
      ...(search
        ? {
            title: { contains: search, mode: "insensitive" },
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
  });
  return NextResponse.json(notices);
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content : "";
  const type = body?.type as NoticeType | undefined;
  const isPopup = Boolean(body?.isPopup);
  const isActive = body?.isActive !== false;
  const version =
    typeof body?.version === "number" && Number.isInteger(body.version) && body.version >= 1
      ? body.version
      : 1;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (type !== undefined && !NOTICE_TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const startsAt = parseOptionalDate(body?.startsAt);
  const endsAt = parseOptionalDate(body?.endsAt);

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      type: type ?? "GENERAL",
      isPopup,
      isActive,
      version,
      startsAt: startsAt === undefined ? null : startsAt,
      endsAt: endsAt === undefined ? null : endsAt,
    },
  });
  return NextResponse.json(notice);
}

function parseOptionalDate(v: unknown): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const d = new Date(v as string);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}
