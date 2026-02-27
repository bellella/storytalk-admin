import { prisma } from "@/lib/prisma";
import { DialogueCreateInput } from "@/src/generated/prisma/models";
import { DialogueType, DialogueSpeakerRole } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const dialogues = await prisma.dialogue.findMany({
    where: { sceneId: parseInt((await params).sceneId) },
    orderBy: { order: "asc" },
    include: {
      character: true,
    },
  });
  return NextResponse.json(dialogues);
}

const AI_DIALOGUE_TYPES = [
  DialogueType.AI_INPUT_SLOT,
  DialogueType.AI_SLOT,
  DialogueType.SPEAKING_MISSION,
];

function buildDialogueData(
  type: string,
  body: Record<string, unknown>,
  sceneId: number,
  order?: number
) {
  const orderNum = order ?? (typeof body.order === "number" ? body.order : 1);
  const base: Record<string, unknown> = {
    sceneId,
    order: orderNum,
    type: (type as DialogueType) || DialogueType.DIALOGUE,
    speakerRole:
      body.speakerRole === DialogueSpeakerRole.USER
        ? DialogueSpeakerRole.USER
        : DialogueSpeakerRole.SYSTEM,
    englishText: String(body.englishText ?? ""),
    koreanText: String(body.koreanText ?? ""),
  };

  if (
    AI_DIALOGUE_TYPES.includes(type as (typeof AI_DIALOGUE_TYPES)[number]) &&
    body.aiPromptName !== undefined
  ) {
    base.aiPromptName =
      typeof body.aiPromptName === "string" ? body.aiPromptName : null;
  }

  if (
    (type === DialogueType.CHOICE ||
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

  // Text-only types (no character/image)
  const textOnlyTypes = [DialogueType.HEADING, DialogueType.CHOICE, "heading"];
  if (textOnlyTypes.includes(type)) {
    return {
      ...base,
      characterName: null,
      characterId: null,
      charImageLabel: null,
      imageUrl: null,
      audioUrl: null,
    };
  }

  return {
    ...base,
    characterName:
      typeof body.characterName === "string" ? body.characterName : null,
    characterId: body.characterId ? parseInt(String(body.characterId)) : null,
    charImageLabel:
      typeof body.charImageLabel === "string" ? body.charImageLabel : null,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
    audioUrl: typeof body.audioUrl === "string" ? body.audioUrl : null,
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const body = await req.json();
  const sceneId = parseInt((await params).sceneId);
  const type = (body.type as string) || DialogueType.DIALOGUE;

  let data: Record<string, unknown>;
  try {
    data = buildDialogueData(type, body, sceneId) as Record<string, unknown>;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid data" },
      { status: 400 }
    );
  }
  const dialogue = await prisma.dialogue.create({
    data: data as DialogueCreateInput,
  });
  return NextResponse.json(dialogue);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId: sceneIdStr } = await params;
  const sceneId = parseInt(sceneIdStr);
  const body = await req.json();
  const dialoguesInput = body.dialogues;

  if (!Array.isArray(dialoguesInput)) {
    return NextResponse.json(
      { error: "dialogues array required" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.dialogue.deleteMany({ where: { sceneId } });
    for (let i = 0; i < dialoguesInput.length; i++) {
      const d = dialoguesInput[i] as Record<string, unknown>;
      const type = (d.type as string) || DialogueType.DIALOGUE;
      const data = buildDialogueData(type, d, sceneId, i + 1);
      await tx.dialogue.create({ data: data as unknown as DialogueCreateInput });
    }
  });

  const dialogues = await prisma.dialogue.findMany({
    where: { sceneId },
    orderBy: { order: "asc" },
    include: { character: true },
  });
  return NextResponse.json(dialogues);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const body = await req.json();
  const sceneId = parseInt((await params).sceneId);
  const rawIds = body.dialogueIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return NextResponse.json(
      { error: "dialogueIds array required" },
      { status: 400 }
    );
  }

  const dialogueIds = rawIds.map((id: unknown) =>
    typeof id === "number" ? id : parseInt(String(id), 10)
  );

  const existing = await prisma.dialogue.findMany({
    where: { id: { in: dialogueIds }, sceneId },
  });
  if (existing.length !== dialogueIds.length) {
    return NextResponse.json(
      { error: "Some dialogue IDs not found or belong to another scene" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Step 1: set all to temp high values to free up order slots (avoid @@unique)
    const tempBase = 1000000;
    for (let i = 0; i < dialogueIds.length; i++) {
      await tx.dialogue.update({
        where: { id: dialogueIds[i] },
        data: { order: tempBase + i },
      });
    }
    // Step 2: set to actual order
    for (let i = 0; i < dialogueIds.length; i++) {
      await tx.dialogue.update({
        where: { id: dialogueIds[i] },
        data: { order: i + 1 },
      });
    }
  });

  const dialogues = await prisma.dialogue.findMany({
    where: { sceneId },
    orderBy: { order: "asc" },
    include: { character: true },
  });
  return NextResponse.json(dialogues);
}
