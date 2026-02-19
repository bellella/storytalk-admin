import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const { id } = await params;
  const ruleId = Number(id);

  const updated = await prisma.xpRule.update({
    where: { id: ruleId },
    data: {
      triggerType: body.triggerType ?? undefined,
      xpAmount:
        body.xpAmount !== undefined ? Number(body.xpAmount) : undefined,
      startsAt:
        body.startsAt !== undefined
          ? body.startsAt
            ? new Date(body.startsAt)
            : null
          : undefined,
      endsAt:
        body.endsAt !== undefined
          ? body.endsAt
            ? new Date(body.endsAt)
            : null
          : undefined,
      priority:
        body.priority !== undefined ? Number(body.priority) : undefined,
      isActive: body.isActive ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ruleId = Number(id);

  await prisma.xpRule.delete({
    where: { id: ruleId },
  });

  return NextResponse.json({ ok: true });
}

