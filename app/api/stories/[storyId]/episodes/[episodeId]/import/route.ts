import { prisma } from "@/lib/prisma";
import { DialogueType } from "@/types";
import { NextResponse } from "next/server";

const importTypeToDialogueType: Record<string, DialogueType> = {
  dialogue: DialogueType.DIALOGUE,
  narration: DialogueType.NARRATION,
  image: DialogueType.IMAGE,
  heading: DialogueType.HEADING,
  choice: DialogueType.CHOICE_SLOT,
  choice_slot: DialogueType.CHOICE_SLOT,
  choice_result: DialogueType.DIALOGUE,
  user_input_slot: DialogueType.AI_INPUT_SLOT,
  ai_input_slot: DialogueType.AI_INPUT_SLOT,
  ai_output_slot: DialogueType.AI_SLOT,
  ai_slot: DialogueType.AI_SLOT,
  speaking_mission: DialogueType.SPEAKING_MISSION,
  repeat_after_me: DialogueType.SPEAKING_MISSION,
};

/** JSON type(string) → DialogueType enum 정규화 (대소문자 무관, dialogues route와 동일) */
function resolveDialogueType(input: unknown): DialogueType {
  const s = typeof input === "string" ? String(input).trim().toLowerCase() : "";
  if (!s) return DialogueType.DIALOGUE;
  return (
    importTypeToDialogueType[s] ??
    (DialogueType as Record<string, string>)[input as string] ??
    DialogueType.DIALOGUE
  );
}

/** 매핑 키 정규화: trim + lowercase + 연속 공백. 발음기호(É→e) 제거 */
function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

/** characterName / character / username / speaker 중 먼저 있는 값 */
function getCharacterName(d: {
  characterName?: string;
  character?: string;
  username?: string;
  speaker?: string;
}): string | null {
  const v =
    d.characterName ??
    d.character ??
    d.username ??
    d.speaker ??
    null;
  return v && String(v).trim() ? String(v).trim() : null;
}

type ImportData = {
  title?: string;
  koreanTitle?: string;
  description?: string;
  koreanDescription?: string;
  characterMap?: Record<string, number>;
  // appendMode: true면 기존 씬 삭제 없이 뒤에 추가
  appendMode?: boolean;
  // sceneIndices: 특정 씬만 import (없으면 전체)
  sceneIndices?: number[];
  scenes?: Array<{
    type?: "VISUAL" | "CHAT";
    flowType?: "NORMAL" | "BRANCH" | "BRANCH_TRIGGER" | "BRANCH_AND_TRIGGER";
    title: string;
    koreanTitle?: string;
    bgImageUrl?: string;
    data?: Record<string, unknown>;
    dialogues: Array<{
      type: string;
      flowType?: "NORMAL" | "BRANCH";
      speakerRole?: string;
      characterName?: string;
      character?: string;
      username?: string;
      speaker?: string;
      charImageLabel?: string;
      englishText?: string;
      koreanText?: string;
      imageUrl?: string;
      audioUrl?: string;
      aiPromptName?: string;
      data?: Record<string, unknown>;
    }>;
  }>;
  reviewItems?: Array<{
    sceneIndex: number;
    dialogueIndex: number;
    description?: string;
  }>;
  quizzes?: Array<{
    type: "SENTENCE_BUILD" | "SENTENCE_CLOZE_BUILD";
    questionEnglish: string;
    questionKorean?: string;
    answerIndex?: number;
    description?: string;
    options?: string[];
    data?: Record<string, unknown>;
  }>;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storyId: string; episodeId: string }> }
) {
  try {
    const { storyId, episodeId } = await params;
    const importData: ImportData = await req.json();
    const episodeIdNum = parseInt(episodeId);

    // Update episode if title/description provided
    if (
      importData.title ||
      importData.koreanTitle ||
      importData.description ||
      importData.koreanDescription
    ) {
      await prisma.episode.update({
        where: { id: episodeIdNum },
        data: {
          ...(importData.title && { title: importData.title }),
          ...(importData.koreanTitle && {
            KoreanTitle: importData.koreanTitle,
          }),
          ...(importData.description && {
            description: importData.description,
          }),
          ...(importData.koreanDescription && {
            koreanDescription: importData.koreanDescription,
          }),
        },
      });
    }

    let scenesCreated = 0;
    let totalDialogues = 0;
    let reviewItemsCreated = 0;
    let quizzesCreated = 0;

    // Handle scenes import (only if scenes array is provided)
    if (importData.scenes && importData.scenes.length > 0) {
      const appendMode = importData.appendMode ?? false;
      const sceneIndices = importData.sceneIndices; // undefined = 전체

      // 선택된 씬만 필터링 (sceneIndices 없으면 전체)
      const scenesToImport = sceneIndices !== undefined
        ? importData.scenes.filter((_, i) => sceneIndices.includes(i))
        : importData.scenes;

      // Build characterMap from database if not provided
      // 씬별/전체 import 모두 동일: URL storyId 기준 (현재 보고 있는 story의 캐릭터)
      const effectiveStoryId = parseInt(storyId, 10);

      let characterMap: Record<string, number> = {};

      if (
        importData.characterMap &&
        Object.keys(importData.characterMap).length > 0
      ) {
        // 사용자 제공 map: 키 정규화(lowercase, trim), 값은 숫자만
        const raw = importData.characterMap as Record<string, unknown>;
        for (const [k, v] of Object.entries(raw)) {
          const key = normalizeKey(k);
          const num = typeof v === "number" ? v : parseInt(String(v), 10);
          if (!isNaN(num)) characterMap[key] = num;
        }
      } else if (!isNaN(effectiveStoryId) && effectiveStoryId > 0) {
        const storyCharacters = await prisma.storyCharacter.findMany({
          where: { storyId: effectiveStoryId },
          include: { character: { select: { id: true, name: true, koreanName: true } } },
        });

        characterMap = storyCharacters.reduce((acc, sc) => {
          if (sc.character) {
            acc[normalizeKey(sc.name)] = sc.character.id;
            acc[normalizeKey(sc.character.name)] = sc.character.id;
            if (sc.character.koreanName?.trim()) {
              acc[normalizeKey(sc.character.koreanName)] = sc.character.id;
            }
          }
          return acc;
        }, {} as Record<string, number>);
      }

      // appendMode가 아니면 기존 씬 삭제
      if (!appendMode) {
        await prisma.dialogue.deleteMany({
          where: { scene: { episodeId: episodeIdNum } },
        });
        await prisma.scene.deleteMany({
          where: { episodeId: episodeIdNum },
        });
      }

      // 시작 order: appendMode면 기존 최대 order + 1
      let startOrder = 1;
      if (appendMode) {
        const maxScene = await prisma.scene.aggregate({
          where: { episodeId: episodeIdNum },
          _max: { order: true },
        });
        startOrder = (maxScene._max.order ?? 0) + 1;
      }

      // Create scenes and dialogues
      for (
        let i = 0;
        i < scenesToImport.length;
        i++
      ) {
        const sceneData = scenesToImport[i];
        const sceneFlowType =
          sceneData.flowType === "BRANCH_AND_TRIGGER" ? "BRANCH_AND_TRIGGER" :
          sceneData.flowType === "BRANCH_TRIGGER" ? "BRANCH_TRIGGER" :
          sceneData.flowType === "BRANCH" ? "BRANCH" : "NORMAL";
        const scene = await prisma.scene.create({
          data: {
            episodeId: episodeIdNum,
            type: sceneData.type === "CHAT" ? "CHAT" : "VISUAL",
            flowType: sceneFlowType,
            title: sceneData.title,
            koreanTitle: sceneData.koreanTitle || null,
            bgImageUrl: sceneData.bgImageUrl || null,
            order: startOrder + i,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(sceneData.data != null && { data: sceneData.data as any }),
          },
        });

        for (
          let dialogueIndex = 0;
          dialogueIndex < sceneData.dialogues.length;
          dialogueIndex++
        ) {
          const dialogueData = sceneData.dialogues[dialogueIndex];
          const dialogueType = resolveDialogueType(dialogueData.type);
          const isHeading = dialogueType === DialogueType.HEADING;
          const charName = getCharacterName(dialogueData);

          let characterId: number | null = null;
          const typeLower = dialogueData.type?.toLowerCase();
          const hasCharacter =
            charName &&
            (typeLower === "dialogue" ||
              typeLower === "choice_result" ||
              typeLower === "user_input_slot" ||
              typeLower === "ai_input_slot" ||
              typeLower === "ai_slot");
          if (hasCharacter) {
            characterId = characterMap[normalizeKey(charName)] ?? null;
            // Fallback: map 조회 실패 시 DB에서 직접 검색 (대소문자/공백 차이 등)
            if (characterId === null && effectiveStoryId) {
              const fallback = await prisma.character.findFirst({
                where: {
                  storyLinks: { some: { storyId: effectiveStoryId } },
                  OR: [
                    { name: { equals: charName, mode: "insensitive" } },
                    { koreanName: { equals: charName, mode: "insensitive" } },
                  ],
                },
                select: { id: true },
              });
              if (fallback) characterId = fallback.id;
            }
          }

          const isUser = dialogueData.speakerRole === "USER";
          const dialogueFlowType =
            dialogueData.flowType === "BRANCH" ? "BRANCH" : "NORMAL";
          await prisma.dialogue.create({
            data: {
              sceneId: scene.id,
              order: dialogueIndex + 1,
              type: dialogueType,
              flowType: dialogueFlowType,
              speakerRole: isUser ? "USER" : "SYSTEM",
              characterId: isUser || isHeading ? null : characterId,
              characterName: isUser || isHeading ? null : charName,
              englishText: dialogueData.englishText ?? "",
              koreanText: dialogueData.koreanText ?? "",
              charImageLabel: isHeading
                ? null
                : dialogueData.charImageLabel || "default",
              imageUrl: isHeading ? null : dialogueData.imageUrl || null,
              audioUrl: dialogueData.audioUrl || null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(dialogueData.data != null && { data: dialogueData.data as any }),
            },
          });
          totalDialogues++;
        }
        scenesCreated++;
      }
    }

    // Handle reviewItems import (only if reviewItems array is provided)
    if (importData.reviewItems && importData.reviewItems.length > 0) {
      // Delete existing review items for this episode
      await prisma.reviewItem.deleteMany({
        where: { episodeId: episodeIdNum },
      });

      // Get all scenes with dialogues for this episode to map sceneIndex/dialogueIndex to dialogueId
      const scenes = await prisma.scene.findMany({
        where: { episodeId: episodeIdNum },
        include: { dialogues: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      });

      // Create a map of sceneIndex -> dialogueIndex -> dialogueId (0-based)
      const dialogueMap: Record<number, Record<number, number>> = {};
      scenes.forEach((scene, sceneIdx) => {
        dialogueMap[sceneIdx] = {};
        scene.dialogues.forEach((dialogue, dialogueIdx) => {
          dialogueMap[sceneIdx][dialogueIdx] = dialogue.id;
        });
      });

      // Create review items (use array index for order)
      for (let i = 0; i < importData.reviewItems.length; i++) {
        const reviewItem = importData.reviewItems[i];
        const dialogueId =
          dialogueMap[reviewItem.sceneIndex]?.[reviewItem.dialogueIndex];
        if (dialogueId) {
          await prisma.reviewItem.create({
            data: {
              episodeId: episodeIdNum,
              dialogueId: dialogueId,
              order: i + 1,
              description: reviewItem.description || null,
            },
          });
          reviewItemsCreated++;
        }
      }
    }

    // Handle quizzes import (only if quizzes array is provided)
    if (importData.quizzes && importData.quizzes.length > 0) {
      // Delete existing quizzes for this episode
      // First delete quiz options (cascade should handle this, but being explicit)
      const existingQuizzes = await prisma.quiz.findMany({
        where: { sourceType: "EPISODE", sourceId: episodeIdNum },
        select: { id: true },
      });
      const quizIds = existingQuizzes.map((q) => q.id);

      if (quizIds.length > 0) {
        await prisma.quiz.deleteMany({
          where: { id: { in: quizIds } },
        });
      }

      // Create quizzes (use array index for order, options are string array)
      for (let i = 0; i < importData.quizzes.length; i++) {
        const quizData = importData.quizzes[i];
        const isSentenceType =
          quizData.type === "SENTENCE_BUILD" ||
          quizData.type === "SENTENCE_CLOZE_BUILD";

        await prisma.quiz.create({
          data: {
            sourceType: "EPISODE",
            sourceId: episodeIdNum,
            type: quizData.type,
            questionEnglish: quizData.questionEnglish,
            questionKorean: quizData.questionKorean || null,
            description: quizData.description || null,
            order: i + 1,
            isActive: true,
            ...(isSentenceType &&
              quizData.data && {
                data: JSON.parse(JSON.stringify(quizData.data)),
              }),
            ...(!isSentenceType &&
              quizData.options && {
                options: {
                  create: quizData.options.map((text, idx) => ({
                    text,
                    order: idx,
                  })),
                },
              }),
          },
        });
        quizzesCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      scenesCreated,
      totalDialogues,
      reviewItemsCreated,
      quizzesCreated,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error.message || "Import failed" },
      { status: 500 }
    );
  }
}
