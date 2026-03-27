import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { UserGender, UserRole } from "@/src/generated/prisma/enums";

const USER_GENDERS: UserGender[] = ["MALE", "FEMALE", "OTHER"];

const userInclude = {
  userSubscriptions: { where: { status: "ACTIVE" as const }, select: { id: true } },
  _count: {
    select: {
      userEpisodes: { where: { isCompleted: true } },
      storyProgress: { where: { isCompleted: true } },
      characterFriends: true,
      dialogueBookmarks: true,
    },
  },
} as const;

const fetchUserWithInclude = (id: number) =>
  prisma.user.findUnique({ where: { id }, include: userInclude });

type UserWithInclude = NonNullable<Awaited<ReturnType<typeof fetchUserWithInclude>>>;

function serializeUser(user: UserWithInclude) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return {
    ...user,
    hasPremium: user.userSubscriptions.length > 0,
    status: new Date(user.lastLoginAt) >= sevenDaysAgo ? "active" : "inactive",
  };
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId);

  const user = await fetchUserWithInclude(id);

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeUser(user));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const id = parseInt(userId);
  const body = await req.json() as {
    role?: UserRole;
    gender?: UserGender | null;
  };

  const data: { role?: UserRole; gender?: UserGender | null } = {};

  if (body.role !== undefined) {
    if (body.role !== "USER" && body.role !== "ADMIN") {
      return NextResponse.json(
        { error: "role must be USER or ADMIN" },
        { status: 400 }
      );
    }
    data.role = body.role;
  }

  if ("gender" in body) {
    const g = body.gender;
    if (g != null && !USER_GENDERS.includes(g)) {
      return NextResponse.json(
        { error: "gender must be MALE, FEMALE, OTHER, or null" },
        { status: 400 }
      );
    }
    data.gender = g ?? null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update (role or gender)" },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  const user = await fetchUserWithInclude(id);

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeUser(user));
}
