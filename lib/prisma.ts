import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 3, // Supabase session mode 동시 커넥션 제한 방지
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
