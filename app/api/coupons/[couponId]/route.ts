import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const coupon = await prisma.coupon.findUnique({
    where: { id: parseInt(couponId) },
    include: {
      codes: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { assignedUser: { select: { id: true, name: true, email: true } } },
      },
      userCoupons: {
        orderBy: { issuedAt: "desc" },
        take: 50,
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { codes: true, userCoupons: true } },
    },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(coupon);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const body = await req.json();

  try {
    const coupon = await prisma.coupon.update({
      where: { id: parseInt(couponId) },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.key !== undefined ? { key: body.key?.trim() || null } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.benefitType !== undefined ? { benefitType: body.benefitType } : {}),
        ...(body.discountAmount !== undefined ? { discountAmount: body.discountAmount } : {}),
        ...(body.discountPercent !== undefined ? { discountPercent: body.discountPercent } : {}),
        ...(body.maxDiscountAmount !== undefined ? { maxDiscountAmount: body.maxDiscountAmount } : {}),
        ...(body.rewardCoinAmount !== undefined ? { rewardCoinAmount: body.rewardCoinAmount } : {}),
        ...(body.minPurchaseAmount !== undefined ? { minPurchaseAmount: body.minPurchaseAmount } : {}),
        ...(body.targetType !== undefined ? { targetType: body.targetType } : {}),
        ...(body.targetId !== undefined ? { targetId: body.targetId } : {}),
        ...(body.validFrom !== undefined ? { validFrom: body.validFrom ? new Date(body.validFrom) : null } : {}),
        ...(body.validUntil !== undefined ? { validUntil: body.validUntil ? new Date(body.validUntil) : null } : {}),
        ...(body.expiresInDays !== undefined ? { expiresInDays: body.expiresInDays } : {}),
        ...(body.isPublic !== undefined ? { isPublic: body.isPublic } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });
    return NextResponse.json(coupon);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: `key '${body.key}' 는 이미 사용 중입니다.` }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;

  await prisma.coupon.update({
    where: { id: parseInt(couponId) },
    data: { status: "DELETED" },
  });

  return NextResponse.json({ ok: true });
}
