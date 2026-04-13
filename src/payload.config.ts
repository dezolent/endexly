import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { Users } from "./payload/collections/users";
import { Pages } from "./payload/collections/pages";
import { Posts } from "./payload/collections/posts";
import { Authors } from "./payload/collections/authors";
import { Media } from "./payload/collections/media";
import { NavMenus } from "./payload/collections/nav-menus";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // ── Admin UI ──────────────────────────────────────────────────────────────
  // Mounted at /cms to avoid conflicting with the platform admin at /admin.
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "— Endexly CMS",
    },
  },

  // ── Collections ──────────────────────────────────────────────────────────
  // Users must be first — it is the auth collection.
  collections: [Users, Pages, Posts, Authors, Media, NavMenus],

  // ── Database ──────────────────────────────────────────────────────────────
  // Use the direct (non-pgbouncer) URL so Payload can run migrations
  // and use prepared statements without pgbouncer transaction-mode issues.
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "",
    },
  }),

  // ── Rich text editor ──────────────────────────────────────────────────────
  editor: lexicalEditor(),

  // ── Security ──────────────────────────────────────────────────────────────
  secret: process.env.PAYLOAD_SECRET || "change-me-in-production",

  // ── TypeScript types ─────────────────────────────────────────────────────
  // Auto-generated on `next dev` / `next build` via withPayload.
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  // ── Routes ────────────────────────────────────────────────────────────────
  routes: {
    admin: "/cms",
    api: "/payload-api",
  },

  // ── Upload ────────────────────────────────────────────────────────────────
  upload: {
    limits: {
      fileSize: 10_000_000, // 10 MB
    },
  },
});
