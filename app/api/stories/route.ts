import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(stories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const story = await prisma.story.create({ data: body });
  return NextResponse.json(story);
}
