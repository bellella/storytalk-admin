import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  const body = await req.json();
  const levelParam = await params;
  const levelNumber = Number(levelParam.level);

  const updated = await prisma.xpLevel.update({
    where: { level: levelNumber },
    data: {
      requiredTotalXp:
        body.requiredTotalXp !== undefined
          ? Number(body.requiredTotalXp)
          : undefined,
      title: body.title ?? undefined,
      isActive: body.isActive ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  const levelParam = await params;
  const levelNumber = Number(levelParam.level);

  await prisma.xpLevel.delete({
    where: { level: levelNumber },
  });

  return NextResponse.json({ ok: true });
}

