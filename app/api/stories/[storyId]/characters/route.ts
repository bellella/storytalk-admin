import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const storyCharacters = await prisma.storyCharacter.findMany({
    where: { storyId },
    include: {
      character: true,
    },
  });
  const data = storyCharacters.map((sc) => ({
    ...sc,
    name: sc.name || sc.character?.name,
  }));
  return NextResponse.json(data);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const body = await req.json();

  // Support both: linking existing character OR creating story-specific character
  const storyCharacter = await prisma.storyCharacter.create({
    data: {
      storyId,
      characterId: body.characterId || null,
      name: body.name || null,
    },
    include: {
      character: true,
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

  // Support delete by storyCharacter id or by characterId
  if (id) {
    await prisma.storyCharacter.delete({
      where: { id },
    });
  } else if (characterId) {
    await prisma.storyCharacter.delete({
      where: {
        storyId_characterId: {
          storyId,
          characterId,
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
