import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { url, name, type } = body;
    const data: { url?: string; name?: string | null; type?: string | null } = {};
    if (typeof url === "string") data.url = url.trim();
    if (name !== undefined) data.name = name ? String(name).trim() : null;
    if (type !== undefined) data.type = type ? String(type).trim() : null;
    const image = await prisma.image.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json({
      ...image,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error("Image update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.image.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Image delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
