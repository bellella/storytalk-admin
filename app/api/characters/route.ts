import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const characters = await prisma.character.findMany({
    include: {
      images: true,
      storyLinks: {
        include: {
          story: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(characters);
}

export async function POST(req: Request) {
  const body = await req.json();
  const character = await prisma.character.create({
    data: {
      name: body.name,
      avatarImage: body.avatarImage,
      mainImage: body.mainImage ?? null,
      description: body.description,
      personality: body.personality,
      aiPrompt: body.aiPrompt,
      greetingMessage: body.greetingMessage ?? null,
      isUserSelectable: body.isUserSelectable ?? false,
      minUserLevel:
        body.isUserSelectable && body.minUserLevel != null
          ? typeof body.minUserLevel === "number"
            ? body.minUserLevel
            : parseInt(String(body.minUserLevel), 10) || 1
          : 1,
    },
  });
  return NextResponse.json(character);
}
