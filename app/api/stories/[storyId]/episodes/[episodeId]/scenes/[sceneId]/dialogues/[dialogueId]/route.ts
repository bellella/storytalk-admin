import { prisma } from "@/lib/prisma";
import { DialogueType, DialogueSpeakerRole } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  const dialogue = await prisma.dialogue.findUnique({
    where: { id: parseInt((await params).dialogueId) },
    include: {
      character: true,
    },
  });
  return NextResponse.json(dialogue);
}

function buildDialogueUpdateData(type: string, body: Record<string, unknown>) {
  const base: Record<string, unknown> = {
    englishText: body.englishText ?? "",
    koreanText: body.koreanText ?? "",
    type:
      (type as DialogueType) ||
      (body.type as DialogueType) ||
      DialogueType.DIALOGUE,
    flowType: body.flowType === "BRANCH" ? "BRANCH" : "NORMAL",
    speakerRole:
      body.speakerRole === DialogueSpeakerRole.USER
        ? DialogueSpeakerRole.USER
        : DialogueSpeakerRole.SYSTEM,
  };
  if (body.order !== undefined)
    base.order =
      typeof body.order === "number"
        ? body.order
        : parseInt(String(body.order));

  const aiTypes = [
    DialogueType.AI_INPUT_SLOT,
    DialogueType.AI_SLOT,
    DialogueType.SPEAKING_MISSION,
  ];
  if (
    aiTypes.includes(type as (typeof aiTypes)[number]) &&
    body.data !== undefined
  ) {
    if (typeof body.data === "object" && body.data !== null) {
      base.data = body.data;
    } else if (typeof body.data === "string") {
      try {
        base.data = JSON.parse(body.data) as Record<string, unknown>;
      } catch {
        base.data = null;
      }
    } else {
      base.data = null;
    }
  }
  if (
    (type === DialogueType.CHOICE_SLOT ||
      type === DialogueType.AI_INPUT_SLOT ||
      type === DialogueType.AI_SLOT) &&
    body.data !== undefined
  ) {
    if (
      typeof body.data === "object" &&
      body.data !== null &&
      !Array.isArray(body.data)
    ) {
      base.data = body.data as Record<string, unknown>;
    } else if (typeof body.data === "string") {
      if (!body.data.trim()) {
        base.data = null;
      } else {
        try {
          const parsed = JSON.parse(body.data) as unknown;
          if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
          ) {
            throw new Error("Data must be a JSON object");
          }
          base.data = parsed as Record<string, unknown>;
        } catch (e) {
          throw new Error(
            `Invalid JSON in data: ${
              e instanceof Error ? e.message : "parse error"
            }`
          );
        }
      }
    } else {
      base.data = null;
    }
  }

  // Types that don't use character - clear characterId, characterName, charImageLabel
  const noCharacterTypes = [
    DialogueType.NARRATION,
    DialogueType.IMAGE,
    DialogueType.HEADING,
    DialogueType.CHOICE_SLOT,
  ];
  if (noCharacterTypes.includes(type as (typeof noCharacterTypes)[number])) {
    const result: Record<string, unknown> = {
      ...base,
      characterName: null,
      characterId: null,
      charImageLabel: null,
    };
    if (type === DialogueType.IMAGE) {
      result.imageUrl = body.imageUrl ?? null;
      result.audioUrl = body.audioUrl ?? null;
    } else {
      result.imageUrl = null;
      result.audioUrl = null;
    }
    return result;
  }

  const speakerRole =
    body.speakerRole === DialogueSpeakerRole.USER
      ? DialogueSpeakerRole.USER
      : DialogueSpeakerRole.SYSTEM;

  if (speakerRole === DialogueSpeakerRole.USER) {
    return {
      ...base,
      characterName: null,
      characterId: null,
      charImageLabel: body.charImageLabel ?? null,
      imageUrl: body.imageUrl ?? null,
      audioUrl: body.audioUrl ?? null,
    };
  }

  return {
    ...base,
    characterName: body.characterName ?? null,
    characterId: body.characterId ? parseInt(String(body.characterId)) : null,
    charImageLabel: body.charImageLabel ?? null,
    imageUrl: body.imageUrl ?? null,
    audioUrl: body.audioUrl ?? null,
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  const body = await req.json();
  const bodyKeys = Object.keys(body);

  // Order-only update (for reordering)
  if (bodyKeys.length === 1 && body.order !== undefined) {
    const dialogue = await prisma.dialogue.update({
      where: { id: parseInt((await params).dialogueId) },
      data: {
        order:
          typeof body.order === "number"
            ? body.order
            : parseInt(String(body.order)),
      },
    });
    return NextResponse.json(dialogue);
  }

  const type = (body.type as string) || DialogueType.DIALOGUE;
  let data: Record<string, unknown>;
  try {
    data = buildDialogueUpdateData(type, body) as Record<string, unknown>;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid data" },
      { status: 400 }
    );
  }
  const dialogue = await prisma.dialogue.update({
    where: { id: parseInt((await params).dialogueId) },
    data,
    include: { character: true },
  });
  return NextResponse.json(dialogue);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  const dialogueId = parseInt((await params).dialogueId);
  await prisma.$transaction(async (tx) => {
    await tx.reviewItem.deleteMany({ where: { dialogueId } });
    await tx.quiz.updateMany({
      where: { dialogueId },
      data: { dialogueId: null },
    });
    await tx.dialogue.delete({ where: { id: dialogueId } });
  });
  return NextResponse.json({ ok: true });
}
