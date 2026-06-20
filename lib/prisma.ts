import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 убрал Rust query-engine по умолчанию: PrismaClient теперь
// требует явный driver adapter вместо "datasourceUrl"/url в schema.prisma.
// CLI (prisma.config.ts) использует DIRECT_URL для миграций, а рантайм
// приложения — пулер DATABASE_URL.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
