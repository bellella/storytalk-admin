import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const storyCharacters = await prisma.storyCharacter.findMany({
    where: { storyId: parseInt(storyId) },
    include: {
      character: {
        include: { images: true },
      },
    },
  });
  return NextResponse.json(storyCharacters);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const body = await req.json();

  // Link existing character to story
  const storyCharacter = await prisma.storyCharacter.create({
    data: {
      storyId: parseInt(storyId),
      characterId: parseInt(body.characterId),
      name: body.name,
    },
    include: {
      character: {
        include: { images: true },
      },
    },
  });

  return NextResponse.json(storyCharacter);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const body = await req.json();

  const where = body.id
    ? { id: parseInt(body.id) }
    : {
        storyId_characterId: {
          storyId: parseInt(storyId),
          characterId: parseInt(body.characterId),
        },
      };

  const storyCharacter = await prisma.storyCharacter.update({
    where,
    data: {
      name: body.name,
    },
    include: {
      character: {
        include: { images: true },
      },
    },
  });

  return NextResponse.json(storyCharacter);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const characterId = searchParams.get("characterId");

  if (id) {
    await prisma.storyCharacter.delete({
      where: { id: parseInt(id) },
    });
  } else if (characterId) {
    await prisma.storyCharacter.delete({
      where: {
        storyId_characterId: {
          storyId: parseInt(storyId),
          characterId: parseInt(characterId),
        },
      },
    });
  } else {
    return NextResponse.json(
      { error: "id or characterId is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
