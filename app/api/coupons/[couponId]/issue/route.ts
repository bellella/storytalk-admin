import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const body = await req.json();
  const couponIdNum = parseInt(couponId);

  const userIds: number[] = Array.isArray(body.userIds)
    ? body.userIds.map((id: unknown) => parseInt(String(id)))
    : body.userId
    ? [parseInt(String(body.userId))]
    : [];

  if (userIds.length === 0) {
    return NextResponse.json({ error: "userId or userIds required" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { id: couponIdNum } });
  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  const now = new Date();
  const validFrom = body.validFrom ? new Date(body.validFrom) : null;
  const validUntil = body.validUntil
    ? new Date(body.validUntil)
    : coupon.expiresInDays
    ? new Date(now.getTime() + coupon.expiresInDays * 86400000)
    : coupon.validUntil ?? null;

  const issued = [];
  for (const userId of userIds) {
    const existing = await prisma.userCoupon.findFirst({
      where: { userId, couponId: couponIdNum, status: "AVAILABLE" },
    });
    if (existing) continue;

    const uc = await prisma.userCoupon.create({
      data: {
        userId,
        couponId: couponIdNum,
        status: "AVAILABLE",
        issuedAt: now,
        validFrom,
        validUntil,
        source: body.source ?? "ADMIN_ISSUE",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    issued.push(uc);
  }

  await prisma.coupon.update({
    where: { id: couponIdNum },
    data: { issuedCount: { increment: issued.length } },
  });

  return NextResponse.json({ issued, skipped: userIds.length - issued.length }, { status: 201 });
}
