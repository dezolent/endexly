/**
 * Payload CMS content seed script — REST API version.
 *
 * Uses Payload's HTTP REST API so it can run with plain `tsx` (no ESM
 * cycle issues from importing payload config outside Next.js).
 *
 * Prerequisites:
 *   1. npm run db:migrate && npm run db:seed   (control-plane data)
 *   2. npm run dev                             (Next.js + Payload running)
 *   3. npm run payload:seed                    (this script, separate terminal)
 *
 * Environment:
 *   SEED_CMS_URL   Base URL of the running dev server.
 *                  Default: http://app.endexly.localhost:3000
 *   SEED_SITE_ID   Override the siteId instead of looking it up from the DB.
 *   DIRECT_DATABASE_URL / DATABASE_URL  Postgres connection for siteId lookup.
 */

import "dotenv/config";
import postgres from "postgres";

const BASE =
  (process.env.SEED_CMS_URL || "http://app.endexly.localhost:3000").replace(
    /\/$/,
    ""
  );
const API = `${BASE}/payload-api`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

async function apiFetch(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<unknown> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `JWT ${token}` } : {}),
    ...(rest.headers as Record<string, string> | undefined),
  };
  const res = await fetchWithTimeout(`${API}${path}`, { ...rest, headers }, 30_000);
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${path} (${res.status}): ${text}`);
  }
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function findSiteId(): Promise<string> {
  if (process.env.SEED_SITE_ID) return process.env.SEED_SITE_ID;

  const conn = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!conn) throw new Error("No database connection string found in env.");

  const client = postgres(conn, { max: 1 });
  const rows = await client<{ id: string }[]>`
    SELECT id FROM sites WHERE slug = 'acme-website' LIMIT 1
  `;
  await client.end();

  if (rows.length === 0) {
    throw new Error(
      "No site with slug 'acme-website' found. Run `npm run db:seed` first."
    );
  }
  return rows[0].id;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const email = "admin@endexly.local";
  const password = "changeme123";

  // Try login first (idempotent re-runs)
  try {
    const res = (await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })) as { token: string };
    console.log("Logged in as existing CMS admin user.");
    return res.token;
  } catch {
    // User doesn't exist yet — create the first user (allowed when count = 0)
    console.log("Creating first CMS admin user...");
    await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify({ email, password, name: "Platform Admin" }),
    });
    const res = (await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })) as { token: string };
    console.log("Created and logged in as CMS admin user.");
    return res.token;
  }
}

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seedPayload() {
  console.log(`\nSeeding Payload CMS via REST API at ${BASE} ...\n`);

  // Verify the server is reachable before doing anything else
  console.log(`Checking server at ${BASE} ...`);
  try {
    await fetchWithTimeout(`${BASE}/cms`, {}, 5000);
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    throw new Error(
      isTimeout
        ? `Timed out connecting to ${BASE}.\n\n` +
          `  1. Make sure \`npm run dev\` is running in another terminal.\n` +
          `  2. If the server is on localhost:3000 (not app.endexly.localhost:3000),\n` +
          `     set SEED_CMS_URL=http://localhost:3000 in your .env and retry.`
        : `Cannot reach ${BASE}: ${err instanceof Error ? err.message : err}\n\n` +
          `  Make sure \`npm run dev\` is running.`
    );
  }
  console.log("Server reachable ✓\n");

  const [token, siteId] = await Promise.all([getToken(), findSiteId()]);
  console.log(`Using siteId: ${siteId}\n`);

  const post = (path: string, body: unknown) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body), token });

  // ── Author ──────────────────────────────────────────────────────────────
  const author = (await post("/authors", {
    siteId,
    name: "Jordan Lee",
    title: "Head of Growth",
    bio: "Jordan writes about product, marketing, and building great software.",
  })) as { doc: { id: string; name: string } };
  console.log("Created author:", author.doc.name);

  // ── Nav menu ─────────────────────────────────────────────────────────────
  const nav = (await post("/navMenus", {
    siteId,
    name: "Main Navigation",
    location: "header",
    items: [
      { label: "Home", url: "/" },
      { label: "About", url: "/about" },
      { label: "Blog", url: "/blog" },
      { label: "Contact", url: "/contact" },
    ],
  })) as { doc: { id: string; name: string } };
  console.log("Created nav menu:", nav.doc.name);

  // ── Homepage ─────────────────────────────────────────────────────────────
  const homepage = (await post("/pages", {
    siteId,
    title: "Home",
    slug: "/",
    status: "published",
    publishedAt: new Date().toISOString(),
    layout: [
      {
        blockType: "hero",
        variant: "centered",
        heading: "Building the Future, One Solution at a Time",
        subheading:
          "Acme Corp provides innovative solutions for modern businesses. Let's build something great together.",
        ctaLabel: "Get Started",
        ctaUrl: "/contact",
        secondaryCtaLabel: "Read Our Blog",
        secondaryCtaUrl: "/blog",
      },
      {
        blockType: "features",
        heading: "Why Choose Acme?",
        subheading: "We deliver results across every dimension.",
        columns: "3",
        items: [
          {
            icon: "Zap",
            title: "Fast Delivery",
            description:
              "We ship fast without cutting corners. Your project on time, every time.",
          },
          {
            icon: "Shield",
            title: "Enterprise Security",
            description:
              "Built-in compliance, audit trails, and SOC 2 readiness from day one.",
          },
          {
            icon: "BarChart3",
            title: "Data-Driven Results",
            description:
              "Every decision backed by real analytics, not guesswork.",
          },
        ],
      },
      {
        blockType: "blogListing",
        heading: "Latest from the Blog",
        subheading: "Insights, news, and product updates.",
        limit: 3,
        showViewAllLink: true,
        viewAllLabel: "View all posts",
      },
      {
        blockType: "cta",
        heading: "Ready to get started?",
        subheading:
          "Join hundreds of companies using Acme to ship faster and scale smarter.",
        primaryCtaLabel: "Start your free trial",
        primaryCtaUrl: "/contact",
        variant: "primary",
      },
    ],
    meta: {
      title: "Acme Corp — Building the Future",
      description:
        "Acme Corp provides innovative solutions for modern businesses.",
    },
  })) as { doc: { id: string; title: string } };
  console.log("Created homepage:", homepage.doc.title);

  // ── About page ────────────────────────────────────────────────────────────
  const about = (await post("/pages", {
    siteId,
    title: "About Us",
    slug: "/about",
    status: "published",
    publishedAt: new Date().toISOString(),
    layout: [
      {
        blockType: "hero",
        variant: "centered",
        heading: "We're Acme Corp",
        subheading:
          "A team of builders, designers, and strategists on a mission to make great software accessible to every business.",
      },
      {
        blockType: "richText",
        maxWidth: "normal",
        content: {
          root: {
            type: "root",
            children: [
              {
                type: "heading",
                tag: "h2",
                children: [{ type: "text", text: "Our Story" }],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    text: "Founded in 2020, Acme Corp started with a simple idea: great software shouldn't require a massive engineering team.",
                  },
                ],
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        },
      },
      {
        blockType: "cta",
        heading: "Come work with us",
        subheading: "We're always looking for great people.",
        primaryCtaLabel: "View open roles",
        primaryCtaUrl: "/careers",
        variant: "default",
      },
    ],
    meta: {
      title: "About — Acme Corp",
      description: "Learn about the Acme Corp team and our mission.",
    },
  })) as { doc: { id: string; title: string } };
  console.log("Created about page:", about.doc.title);

  // ── Blog post ─────────────────────────────────────────────────────────────
  const blogPost = (await post("/posts", {
    siteId,
    title: "How We Scaled to 10,000 Customers Without Breaking a Sweat",
    slug: "how-we-scaled-to-10000-customers",
    status: "published",
    publishedAt: new Date().toISOString(),
    author: author.doc.id,
    excerpt:
      "Building for scale doesn't have to mean sacrificing velocity. Here's the architecture that got us to 10k.",
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "heading",
            tag: "h2",
            children: [
              {
                type: "text",
                text: "The Problem With Premature Optimization",
              },
            ],
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Most startups over-architect before they understand the problem. We made the opposite mistake — and then fixed it.",
              },
            ],
          },
          {
            type: "heading",
            tag: "h2",
            children: [
              { type: "text", text: "The Architecture That Works" },
            ],
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "We settled on a multi-tenant PostgreSQL setup with row-level tenancy, a shared application server, and a CDN at the edge. Simple, boring, and extremely effective.",
              },
            ],
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
    tags: [{ tag: "Engineering" }, { tag: "Scale" }, { tag: "Architecture" }],
    meta: {
      title:
        "How We Scaled to 10,000 Customers Without Breaking a Sweat — Acme Blog",
      description:
        "Building for scale doesn't have to mean sacrificing velocity.",
    },
  })) as { doc: { id: string; title: string } };
  console.log("Created blog post:", blogPost.doc.title);

  console.log("\n✓ Payload seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("CMS admin:");
  console.log(`  URL:      ${BASE}/cms`);
  console.log("  Email:    admin@endexly.local");
  console.log("  Password: changeme123");
  console.log("\nTenant site:");
  console.log("  http://acme-corp.endexly.localhost:3000");
  console.log("─────────────────────────────────────────");
  console.log("\n⚠  Change the CMS admin password after first login.\n");
}

seedPayload().catch((err) => {
  console.error("\n✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
