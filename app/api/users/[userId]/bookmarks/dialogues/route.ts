import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  const bookmarks = await prisma.dialogueBookmark.findMany({
    where: { userId: params.userId },
    include: {
      dialogue: {
        include: {
          character: true,
        },
      },
    },
  });
  return NextResponse.json(bookmarks);
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { dialogueId } = await req.json();
  const bookmark = await prisma.dialogueBookmark.create({
    data: {
      userId: params.userId,
      dialogueId,
    },
  });
  return NextResponse.json(bookmark);
}
