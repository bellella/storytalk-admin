import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const prompts = await prisma.promptTemplate.findMany({
    orderBy: [{ type: "asc" }, { key: "asc" }],
  });
  return NextResponse.json(prompts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = await prisma.promptTemplate.create({ data: body });
  return NextResponse.json(prompt);
}
