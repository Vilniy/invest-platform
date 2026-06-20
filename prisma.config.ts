import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // CLI commands (db push, migrate) need a direct, non-pooled connection.
  // Supabase's pgbouncer pooler (port 6543) doesn't support the session
  // features Prisma's migration engine needs, and db push will hang.
  // The app's runtime PrismaClient should use the pooled DATABASE_URL instead
  // (pass it explicitly, since this file only affects the CLI, not the client).
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
