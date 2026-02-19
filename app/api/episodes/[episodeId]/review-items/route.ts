import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const reviewItems = await prisma.reviewItem.findMany({
      where: { episodeId: parseInt(episodeId) },
      orderBy: { order: "asc" },
    });

    // Fetch dialogue details for each review item
    const reviewItemsWithDialogue = await Promise.all(
      reviewItems.map(async (item) => {
        const dialogue = await prisma.dialogue.findUnique({
          where: { id: item.dialogueId },
          include: {
            scene: { select: { title: true, order: true } },
          },
        });
        return {
          ...item,
          dialogue,
          sceneOrder: dialogue?.scene?.order,
          dialogueOrder: dialogue?.order,
        };
      })
    );

    return NextResponse.json(reviewItemsWithDialogue);
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

    // Get the next order
    const maxOrder = await prisma.reviewItem.aggregate({
      where: { episodeId: parseInt(episodeId) },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const reviewItem = await prisma.reviewItem.create({
      data: {
        episodeId: parseInt(episodeId),
        dialogueId: body.dialogueId,
        description: body.description || null,
        order: body.order ?? nextOrder,
      },
    });

    return NextResponse.json(reviewItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
