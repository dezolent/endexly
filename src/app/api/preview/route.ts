/**
 * /api/preview — Enable Next.js Draft Mode for Payload CMS previews.
 *
 * Usage (from Payload's "Preview URL" admin field):
 *   https://<tenant-domain>/api/preview?secret=<PAYLOAD_PREVIEW_SECRET>&slug=<page-slug>
 *
 * The secret prevents arbitrary users from activating draft mode.
 * The slug is used to redirect the user to the correct page after enabling.
 */

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";

  // ── Secret check ──────────────────────────────────────────────────────────
  const expectedSecret = process.env.PAYLOAD_PREVIEW_SECRET;
  if (!expectedSecret) {
    return new Response("Preview secret not configured", { status: 500 });
  }
  if (secret !== expectedSecret) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  // ── Validate slug is a relative path ─────────────────────────────────────
  // Prevent open-redirect: only allow relative paths starting with /
  const safePath = slug.startsWith("/") ? slug : `/${slug}`;

  // ── Enable draft mode ─────────────────────────────────────────────────────
  const draft = await draftMode();
  draft.enable();

  // Redirect to the requested page
  redirect(safePath);
}
