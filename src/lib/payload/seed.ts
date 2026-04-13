/**
 * Payload CMS content seed script.
 *
 * Seeds a CMS admin user, nav menu, homepage, about page, author, and
 * blog post for the sample "Acme Corp" site created by the Drizzle seed.
 *
 * Run after `npm run db:seed`:
 *   npm run payload:seed
 *
 * Required env vars:
 *   DIRECT_DATABASE_URL (or DATABASE_URL) — Postgres connection
 *   PAYLOAD_SECRET                         — JWT signing secret
 *
 * Optional:
 *   SEED_SITE_ID — the sites.id from the Drizzle seed.
 *                  If unset the script looks up "acme-website" automatically.
 */

import "dotenv/config";
import { getPayload } from "payload";
import config from "../../payload.config";
import postgres from "postgres";

async function findSiteId(): Promise<string> {
  // If the caller already knows it, use it
  if (process.env.SEED_SITE_ID) return process.env.SEED_SITE_ID;

  // Otherwise look up the slug "acme-website" from the control-plane DB
  const conn = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!conn) throw new Error("Database connection string not found");

  const client = postgres(conn, { max: 1 });
  const rows = await client<{ id: string }[]>`
    SELECT id FROM sites WHERE slug = 'acme-website' LIMIT 1
  `;
  await client.end();

  if (rows.length === 0) {
    throw new Error(
      "No site found with slug 'acme-website'. Run npm run db:seed first."
    );
  }
  return rows[0].id;
}

async function seedPayload() {
  const payload = await getPayload({ config });

  console.log("Seeding Payload CMS content...\n");

  const siteId = await findSiteId();
  console.log(`Using siteId: ${siteId}`);

  // ── 1. CMS admin user ────────────────────────────────────────────────────
  let adminUser;
  try {
    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: "admin@endexly.local" } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.docs.length > 0) {
      adminUser = existing.docs[0];
      console.log("CMS admin user already exists:", adminUser.email);
    } else {
      adminUser = await payload.create({
        collection: "users",
        data: {
          email: "admin@endexly.local",
          password: "changeme123",
          name: "Platform Admin",
        },
        overrideAccess: true,
      });
      console.log("Created CMS admin user:", adminUser.email);
    }
  } catch (err) {
    console.error("Failed to create CMS user:", err);
  }

  // ── 2. Author ─────────────────────────────────────────────────────────────
  const author = await payload.create({
    collection: "authors",
    data: {
      siteId,
      name: "Jordan Lee",
      title: "Head of Growth",
      bio: "Jordan writes about product, marketing, and building great software.",
    },
    overrideAccess: true,
  });
  console.log("Created author:", author.name);

  // ── 3. Nav menu ───────────────────────────────────────────────────────────
  const navMenu = await payload.create({
    collection: "navMenus",
    data: {
      siteId,
      name: "Main Navigation",
      location: "header",
      items: [
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
        { label: "Blog", url: "/blog" },
        { label: "Contact", url: "/contact" },
      ],
    },
    overrideAccess: true,
  });
  console.log("Created nav menu:", navMenu.name);

  // ── 4. Homepage ──────────────────────────────────────────────────────────
  const homepage = await payload.create({
    collection: "pages",
    data: {
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
    },
    overrideAccess: true,
  });
  console.log("Created homepage:", homepage.title);

  // ── 5. About page ────────────────────────────────────────────────────────
  const aboutPage = await payload.create({
    collection: "pages",
    data: {
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
                      text: "Founded in 2020, Acme Corp started with a simple idea: great software shouldn't require a massive engineering team. We built tools that let small teams punch above their weight.",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      text: "Today, we serve hundreds of companies across North America and Europe.",
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
    },
    overrideAccess: true,
  });
  console.log("Created about page:", aboutPage.title);

  // ── 6. Blog post ─────────────────────────────────────────────────────────
  const blogPost = await payload.create({
    collection: "posts",
    data: {
      siteId,
      title: "How We Scaled to 10,000 Customers Without Breaking a Sweat",
      slug: "how-we-scaled-to-10000-customers",
      status: "published",
      publishedAt: new Date().toISOString(),
      author: author.id,
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
                  text: "Most startups over-architect before they understand the problem. We made the opposite mistake — and then fixed it. Here's what we learned.",
                },
              ],
            },
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "The Architecture That Works" }],
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
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "The key insight: isolation doesn't require separate databases. It requires discipline.",
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
      tags: [
        { tag: "Engineering" },
        { tag: "Scale" },
        { tag: "Architecture" },
      ],
      meta: {
        title:
          "How We Scaled to 10,000 Customers Without Breaking a Sweat — Acme Blog",
        description:
          "Building for scale doesn't have to mean sacrificing velocity.",
      },
    },
    overrideAccess: true,
  });
  console.log("Created blog post:", blogPost.title);

  console.log("\n--- Payload seed complete! ---");
  console.log("\nCMS admin credentials:");
  console.log("  URL:      http://app.endexly.localhost:3000/cms");
  console.log("  Email:    admin@endexly.local");
  console.log("  Password: changeme123");
  console.log("\nChange the password immediately after first login.");

  process.exit(0);
}

seedPayload().catch((err) => {
  console.error("Payload seed failed:", err);
  process.exit(1);
});
