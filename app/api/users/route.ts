import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [users, totalCount, activeCount, premiumCount] = await Promise.all([
    prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        role: true,
        XpLevel: true,
        xp: true,
        streakDays: true,
        lastLoginAt: true,
        registeredAt: true,
        userSubscriptions: { where: { status: "ACTIVE" }, select: { id: true } },
      },
      orderBy: { lastLoginAt: "desc" },
      take: 200,
    }),
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
    prisma.userSubscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const mapped = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    profileImage: null,
    gender: u.gender,
    role: u.role,
    XpLevel: u.XpLevel,
    xp: u.xp,
    streakDays: u.streakDays,
    lastLoginAt: u.lastLoginAt,
    registeredAt: u.registeredAt,
    hasPremium: u.userSubscriptions.length > 0,
    status: new Date(u.lastLoginAt) >= sevenDaysAgo ? "active" : "inactive",
  }));

  return NextResponse.json({
    users: mapped,
    stats: { total: totalCount, active: activeCount, premium: premiumCount },
  });
}
