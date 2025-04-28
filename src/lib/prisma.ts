import { PrismaClient } from "@/generated/prisma";

// Явная установка переменной окружения DATABASE_URL, если она не определена
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/jira_clone?schema=public";
  console.log("DATABASE_URL установлен вручную в lib/prisma.ts");
}

// Используем глобальный экземпляр PrismaClient для предотвращения
// множественных экземпляров клиента в режиме разработки
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 