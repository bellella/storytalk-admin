import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userSubscriptions: { where: { status: "ACTIVE" }, select: { id: true } },
      _count: {
        select: {
          userEpisodes: { where: { isCompleted: true } },
          storyProgress: { where: { isCompleted: true } },
          characterFriends: true,
          dialogueBookmarks: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return NextResponse.json({
    ...user,
    hasPremium: user.userSubscriptions.length > 0,
    status: new Date(user.lastLoginAt) >= sevenDaysAgo ? "active" : "inactive",
  });
}
