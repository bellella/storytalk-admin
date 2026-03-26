import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const uid = parseInt(userId);
  if (isNaN(uid)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const chats = await prisma.characterChat.findMany({
    where: { userId: uid },
    include: {
      character: {
        select: {
          id: true,
          name: true,
          koreanName: true,
          avatarImage: true,
          mainImage: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(chats);
}
