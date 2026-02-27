import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  const friends = await prisma.characterFriend.findMany({
    where: { userId: parseInt(params.userId) },
    include: {
      character: true,
    },
  });
  return NextResponse.json(friends);
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { characterId } = await req.json();
  const friend = await prisma.characterFriend.create({
    data: {
      userId: parseInt(params.userId),
      characterId,
    },
  });
  return NextResponse.json(friend);
}
