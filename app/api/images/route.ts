import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export type ImageBasic = {
  id: number;
  name: string | null;
  url: string;
  type: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const typeFilter = searchParams.get("type")?.trim() || "";

  const where: {
    OR?: Array<{ name?: { contains: string; mode: "insensitive" }; url?: { contains: string; mode: "insensitive" } }>;
    type?: string;
  } = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { url: { contains: search, mode: "insensitive" } },
    ];
  }
  if (typeFilter) {
    where.type = typeFilter;
  }

  const images = await prisma.image.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
      updatedAt: img.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, name, type } = body;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    const image = await prisma.image.create({
      data: { url: url.trim(), name: name?.trim() || null, type: type?.trim() || null },
    });
    return NextResponse.json({
      ...image,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error("Image create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 500 }
    );
  }
}
