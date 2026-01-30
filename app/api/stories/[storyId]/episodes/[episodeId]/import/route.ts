import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ImportData = {
  title?: string;
  koreanTitle?: string;
  description?: string;
  koreanDescription?: string;
  characterMap: Record<string, string>; // characterName -> characterId
  scenes: Array<{
    title: string;
    koreanTitle?: string;
    order: number;
    dialogues: Array<{
      order: number;
      type: "dialogue" | "narration" | "image";
      characterName: string;
      charImageLabel?: string;
      englishText: string;
      koreanText: string;
      imageUrl?: string;
    }>;
  }>;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storyId: string; episodeId: string }> }
) {
  try {
    const { storyId, episodeId } = await params;
    const importData: ImportData = await req.json();

    // Validate characterMap
    if (
      !importData.characterMap ||
      typeof importData.characterMap !== "object"
    ) {
      return NextResponse.json(
        { error: "characterMap is required" },
        { status: 400 }
      );
    }

    // Update episode if title/description provided
    if (
      importData.title ||
      importData.koreanTitle ||
      importData.description ||
      importData.koreanDescription
    ) {
      await prisma.episode.update({
        where: { id: episodeId },
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

    // Delete existing scenes and dialogues (cascade will handle dialogues)
    await prisma.dialogue.deleteMany({
      where: {
        scene: {
          episodeId: episodeId,
        },
      },
    });
    await prisma.scene.deleteMany({
      where: { episodeId: episodeId },
    });

    // Create scenes and dialogues
    const createdScenes = [];
    for (const sceneData of importData.scenes) {
      const scene = await prisma.scene.create({
        data: {
          episodeId: episodeId,
          title: sceneData.title,
          koreanTitle: sceneData.koreanTitle || null,
          order: sceneData.order,
        },
      });

      // Create dialogues for this scene
      for (const dialogueData of sceneData.dialogues) {
        // Map characterName to characterId using characterMap
        let characterId: string | null = null;
        if (dialogueData.characterName && dialogueData.type === "dialogue") {
          characterId =
            importData.characterMap[dialogueData.characterName] || null;
          // if (!characterId) {
          //   console.warn(
          //     `Character "${dialogueData.characterName}" not found in characterMap`
          //   );
          // }
        }
        const data = {
          sceneId: scene.id,
          order: dialogueData.order,
          type: dialogueData.type,
          characterId: characterId,
          characterName: dialogueData.characterName,
          englishText: dialogueData.englishText,
          koreanText: dialogueData.koreanText,
          charImageLabel: dialogueData.charImageLabel || null,
          imageUrl: dialogueData.imageUrl || null,
        };

        console.log(data, "data");

        await prisma.dialogue.create({
          data,
        });
      }

      createdScenes.push(scene);
    }

    return NextResponse.json({
      success: true,
      scenesCreated: createdScenes.length,
      totalDialogues: importData.scenes.reduce(
        (sum, scene) => sum + scene.dialogues.length,
        0
      ),
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error.message || "Import failed" },
      { status: 500 }
    );
  }
}
