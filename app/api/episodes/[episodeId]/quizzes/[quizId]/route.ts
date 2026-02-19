import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {
      type: body.type,
      questionEnglish: body.questionEnglish,
      questionKorean: body.questionKorean,
      description: body.description,
      order: body.order,
      isActive: body.isActive,
      data: body.data,
    };
    if (
      body.level &&
      ["BEGINNER", "BASIC", "INTERMEDIATE", "ADVANCED", "MASTER"].includes(
        body.level
      )
    ) {
      data.level = body.level;
    }
    const quiz = await prisma.quiz.update({
      where: { id: parseInt(quizId) },
      data,
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ episodeId: string; quizId: string }> }
) {
  try {
    const { quizId } = await params;

    await prisma.quiz.delete({
      where: { id: parseInt(quizId) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
