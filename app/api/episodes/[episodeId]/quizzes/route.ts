import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const episodeIdNum = parseInt(episodeId);

    const episode = await prisma.episode.findUnique({
      where: { id: episodeIdNum },
      select: { storyId: true },
    });
    let storyLevel:
      | "BEGINNER"
      | "BASIC"
      | "INTERMEDIATE"
      | "ADVANCED"
      | "MASTER" = "BEGINNER";
    if (episode) {
      const story = await prisma.story.findUnique({
        where: { id: episode.storyId! },
        select: { level: true },
      });
      if (story) storyLevel = story.level;
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        sourceType: "EPISODE",
        sourceId: episodeIdNum,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ quizzes, storyLevel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const body = await req.json();

    const episodeRow = await prisma.episode.findUnique({
      where: { id: parseInt(episodeId) },
      select: { storyId: true },
    });
    let storyLevel:
      | "BEGINNER"
      | "BASIC"
      | "INTERMEDIATE"
      | "ADVANCED"
      | "MASTER" = "BEGINNER";
    if (episodeRow) {
      const story = await prisma.story.findUnique({
        where: { id: episodeRow.storyId! },
        select: { level: true },
      });
      if (story) storyLevel = story.level;
    }
    const level =
      body.level &&
      ["BEGINNER", "BASIC", "INTERMEDIATE", "ADVANCED", "MASTER"].includes(
        body.level
      )
        ? body.level
        : storyLevel;

    const maxOrder = await prisma.quiz.aggregate({
      where: {
        sourceType: "EPISODE",
        sourceId: parseInt(episodeId),
      },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const quiz = await prisma.quiz.create({
      data: {
        sourceType: "EPISODE",
        sourceId: parseInt(episodeId),
        type: body.type || "SENTENCE_BUILD",
        level,
        questionEnglish: body.questionEnglish || "",
        questionKorean: body.questionKorean || null,
        description: body.description || null,
        order: body.order ?? nextOrder,
        isActive: body.isActive ?? true,
        data: body.data ?? undefined,
      },
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
