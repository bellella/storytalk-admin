import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const storyCharacters = await prisma.storyCharacter.findMany({
    where: { storyId: parseInt(storyId) },
    orderBy: [{ order: "asc" }, { id: "asc" }],
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

  const sid = parseInt(storyId);
  const maxOrder = await prisma.storyCharacter.aggregate({
    where: { storyId: sid },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  // Link existing character to story
  const storyCharacter = await prisma.storyCharacter.create({
    data: {
      storyId: sid,
      characterId: parseInt(body.characterId),
      name: body.name,
      order: nextOrder,
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
  const sid = parseInt(storyId);
  const body = await req.json();

  // 일괄 순서 변경: { storyCharacterIds: number[] } (드래그 정렬)
  const rawIds = body.storyCharacterIds;
  if (Array.isArray(rawIds) && rawIds.length > 0) {
    const ids = rawIds.map((id: unknown) =>
      typeof id === "number" ? id : parseInt(String(id), 10)
    );
    const existing = await prisma.storyCharacter.findMany({
      where: { id: { in: ids }, storyId: sid },
    });
    if (existing.length !== ids.length) {
      return NextResponse.json(
        { error: "Some story character IDs not found or belong to another story" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const tempBase = 1_000_000;
      for (let i = 0; i < ids.length; i++) {
        await tx.storyCharacter.update({
          where: { id: ids[i] },
          data: { order: tempBase + i },
        });
      }
      for (let i = 0; i < ids.length; i++) {
        await tx.storyCharacter.update({
          where: { id: ids[i] },
          data: { order: i + 1 },
        });
      }
    });

    const storyCharacters = await prisma.storyCharacter.findMany({
      where: { storyId: sid },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      include: {
        character: { include: { images: true } },
      },
    });
    return NextResponse.json(storyCharacters);
  }

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
      ...(body.name !== undefined && { name: body.name }),
      ...(typeof body.listed === "boolean" && { listed: body.listed }),
      ...(typeof body.order === "number" &&
        Number.isFinite(body.order) && { order: Math.floor(body.order) }),
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
