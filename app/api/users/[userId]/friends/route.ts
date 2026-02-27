import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const friends = await prisma.characterFriend.findMany({
    where: { userId: parseInt(userId) },
    include: {
      character: {
        select: { id: true, name: true, avatarImage: true, mainImage: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(friends);
}
