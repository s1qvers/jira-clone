import { PrismaClient } from "@/generated/prisma";

// Используем глобальный экземпляр PrismaClient для предотвращения
// множественных экземпляров клиента в режиме разработки
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 