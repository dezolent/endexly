/**
 * Server-side Payload local API helpers for tenant website rendering.
 *
 * Uses `getPayload` from the `payload` package which initialises a singleton
 * instance — safe to call from multiple server components in the same request.
 * All queries use `overrideAccess: true` because they run server-side and we
 * control what is displayed (published content only, unless draft mode is on).
 */

import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";

// ── Pages ─────────────────────────────────────────────────────────────────────

/**
 * Fetch a single page by siteId + slug.
 * @param draft  When true, returns draft versions (used in preview mode).
 */
export async function getPageBySlug(
  siteId: string,
  slug: string,
  draft = false
) {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { siteId: { equals: siteId } },
    { slug: { equals: slug } },
  ];
  if (!draft) {
    conditions.push({ status: { equals: "published" } });
  }

  const result = await payload.find({
    collection: "pages",
    where: { and: conditions },
    draft,
    limit: 1,
    overrideAccess: true,
  });

  return result.docs[0] ?? null;
}

// ── Posts ─────────────────────────────────────────────────────────────────────

/** Fetch a single post by siteId + slug. */
export async function getPostBySlug(
  siteId: string,
  slug: string,
  draft = false
) {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { siteId: { equals: siteId } },
    { slug: { equals: slug } },
  ];
  if (!draft) {
    conditions.push({ status: { equals: "published" } });
  }

  const result = await payload.find({
    collection: "posts",
    where: { and: conditions },
    draft,
    limit: 1,
    overrideAccess: true,
  });

  return result.docs[0] ?? null;
}

/** List published posts for a site (for blog index + BlogListing blocks). */
export async function listPostsBySite(
  siteId: string,
  {
    limit = 10,
    page = 1,
  }: { limit?: number; page?: number } = {}
) {
  const payload = await getPayload({ config });

  return payload.find({
    collection: "posts",
    where: {
      and: [
        { siteId: { equals: siteId } },
        { status: { equals: "published" } },
      ],
    },
    sort: "-publishedAt",
    limit,
    page,
    overrideAccess: true,
  });
}

// ── Nav Menus ─────────────────────────────────────────────────────────────────

/** Fetch a nav menu by siteId + location (header | footer | sidebar). */
export async function getNavMenu(
  siteId: string,
  location: "header" | "footer" | "sidebar"
) {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "navMenus",
    where: {
      and: [
        { siteId: { equals: siteId } },
        { location: { equals: location } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });

  return result.docs[0] ?? null;
}

// ── Media ─────────────────────────────────────────────────────────────────────

/** Resolve a media document by ID. */
export async function getMediaById(id: string) {
  const payload = await getPayload({ config });
  try {
    return await payload.findByID({
      collection: "media",
      id,
      overrideAccess: true,
    });
  } catch {
    return null;
  }
}
