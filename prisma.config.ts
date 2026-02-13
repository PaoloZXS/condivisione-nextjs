// Prisma configuration for local SQLite database
import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node ./prisma/seed.js"
  },
  datasource: {
    url: databaseUrl,
  },
});
