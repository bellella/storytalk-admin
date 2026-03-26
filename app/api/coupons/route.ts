import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const benefitType = searchParams.get("benefitType");
  const search = searchParams.get("search");

  const coupons = await prisma.coupon.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as any } : {}),
      ...(benefitType && benefitType !== "ALL" ? { benefitType: benefitType as any } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { codes: true, userCoupons: true } },
    },
  });

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const coupon = await prisma.coupon.create({
      data: {
        name: body.name,
        key: body.key?.trim() || null,
        description: body.description ?? null,
        benefitType: body.benefitType,
        discountAmount: body.discountAmount ?? null,
        discountPercent: body.discountPercent ?? null,
        maxDiscountAmount: body.maxDiscountAmount ?? null,
        rewardCoinAmount: body.rewardCoinAmount ?? null,
        minPurchaseAmount: body.minPurchaseAmount ?? null,
        targetType: body.targetType ?? "ALL",
        targetId: body.targetId ?? null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        expiresInDays: body.expiresInDays ?? null,
        isPublic: body.isPublic ?? true,
        status: body.status ?? "ACTIVE",
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: `key '${body.key}' 는 이미 사용 중입니다.` }, { status: 409 });
    }
    throw e;
  }
}
