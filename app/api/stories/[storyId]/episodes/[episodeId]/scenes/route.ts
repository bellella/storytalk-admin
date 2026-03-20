import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const episodeId = parseInt((await params).episodeId);
  const scenes = await prisma.scene.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(scenes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const body = await req.json();
  const episodeId = parseInt((await params).episodeId);
  const flowType =
    body.flowType === "BRANCH_AND_TRIGGER" ? "BRANCH_AND_TRIGGER" :
    body.flowType === "BRANCH_TRIGGER" ? "BRANCH_TRIGGER" :
    body.flowType === "BRANCH" ? "BRANCH" : "NORMAL";

  const scene = await prisma.scene.create({
    data: {
      episodeId,
      type: body.type === "CHAT" ? "CHAT" : "VISUAL",
      flowType,
      title: body.title ?? "Scene",
      koreanTitle: body.koreanTitle ?? null,
      order: typeof body.order === "number" ? body.order : 1,
      bgImageUrl: body.bgImageUrl ?? null,
      audioUrl: body.audioUrl ?? null,
      ...(body.data != null && typeof body.data === "object" && { data: body.data }),
    },
  });
  return NextResponse.json(scene);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const body = await req.json();
  const episodeId = parseInt((await params).episodeId);
  const rawIds = body.sceneIds;
  if (!Array.isArray(rawIds) || rawIds.length === 0) {
    return NextResponse.json(
      { error: "sceneIds array required" },
      { status: 400 }
    );
  }

  const sceneIds = rawIds.map((id: unknown) =>
    typeof id === "number" ? id : parseInt(String(id), 10)
  );

  const existing = await prisma.scene.findMany({
    where: { id: { in: sceneIds }, episodeId },
  });
  if (existing.length !== sceneIds.length) {
    return NextResponse.json(
      { error: "Some scene IDs not found or belong to another episode" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    const tempBase = 1000000;
    for (let i = 0; i < sceneIds.length; i++) {
      await tx.scene.update({
        where: { id: sceneIds[i] },
        data: { order: tempBase + i },
      });
    }
    for (let i = 0; i < sceneIds.length; i++) {
      await tx.scene.update({
        where: { id: sceneIds[i] },
        data: { order: i + 1 },
      });
    }
  });

  const scenes = await prisma.scene.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(scenes);
}
