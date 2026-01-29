import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { storyId: string } }
) {
  const characters = await prisma.storyCharacter.findMany({
    where: { storyId: params.storyId },
    include: {
      character: {
        include: {
          images: true,
        },
      },
    },
  });
  return NextResponse.json(characters);
}

export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  const body = await req.json(); // { characterId }
  const link = await prisma.storyCharacter.create({
    data: {
      storyId: params.storyId,
      characterId: body.characterId,
    },
  });
  return NextResponse.json(link);
}
