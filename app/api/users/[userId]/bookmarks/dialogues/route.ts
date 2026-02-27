import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const bookmarks = await prisma.dialogueBookmark.findMany({
    where: { userId: parseInt(userId) },
    include: {
      dialogue: {
        include: {
          character: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}
