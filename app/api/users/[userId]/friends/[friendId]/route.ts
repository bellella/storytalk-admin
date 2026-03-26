import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string; friendId: string }> }
) {
  const { userId, friendId } = await params;
  const body = await req.json();
  const { affinity } = body;

  if (typeof affinity !== "number" || !Number.isInteger(affinity) || affinity < 0) {
    return NextResponse.json({ error: "유효하지 않은 affinity 값입니다" }, { status: 400 });
  }

  const updated = await prisma.characterFriend.update({
    where: {
      id: parseInt(friendId),
      userId: parseInt(userId),
    },
    data: { affinity },
  });

  return NextResponse.json(updated);
}
