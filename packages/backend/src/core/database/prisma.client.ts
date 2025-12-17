import { PrismaClient } from "@prisma/client";

const LOG_LEVELS_DEV = ["query", "error", "warn"] as const;
const LOG_LEVELS_PROD = ["error"] as const;

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? [...LOG_LEVELS_DEV] : [...LOG_LEVELS_PROD],
  });
};

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
