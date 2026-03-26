import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function generateCode(prefix?: string): string {
  const random = randomBytes(4).toString("hex").toUpperCase();
  return prefix ? `${prefix}-${random}` : random;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const codes = await prisma.couponCode.findMany({
    where: { couponId: parseInt(couponId) },
    orderBy: { createdAt: "desc" },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json(codes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const body = await req.json();
  const count = Math.min(Number(body.count ?? 1), 100);
  const prefix = body.prefix ?? "";
  const assignedUserId = body.assignedUserId ?? null;

  const created = [];
  for (let i = 0; i < count; i++) {
    let code: string;
    let attempts = 0;
    do {
      code = generateCode(prefix || undefined);
      attempts++;
      if (attempts > 20) break;
    } while (await prisma.couponCode.findUnique({ where: { code } }));

    const item = await prisma.couponCode.create({
      data: {
        couponId: parseInt(couponId),
        code,
        assignedUserId: assignedUserId ? parseInt(String(assignedUserId)) : null,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
    created.push(item);
  }

  await prisma.coupon.update({
    where: { id: parseInt(couponId) },
    data: { issuedCount: { increment: created.length } },
  });

  return NextResponse.json(created, { status: 201 });
}
