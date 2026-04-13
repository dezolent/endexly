import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// Drizzle Kit runs DDL statements (CREATE TABLE, ALTER, etc.) which require
// a direct connection — Neon's pooled endpoint doesn't support these.
// Fall back to DATABASE_URL if DIRECT_DATABASE_URL is not set.
const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required for migrations");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
