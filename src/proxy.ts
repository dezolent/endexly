/**
 * src/proxy.ts — Next.js 16 Proxy (formerly Middleware)
 *
 * Handles three concerns in order:
 *  1. Rejects invalid hostnames with HTTP 400.
 *  2. Rewrites tenant subdomains / custom domains to /site/[domain].
 *  3. Redirects the app subdomain root to /admin.
 *  4. Protects /admin, /cms, and /dashboard with Clerk authentication.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseHostname } from "@/lib/tenant/hostname";

// NOTE: Route groups like (internal) and (customer) are NOT part of the URL.
// The actual paths are /admin/... and /dashboard/... — match those directly.
// /cms is the Payload CMS admin — also Clerk-protected (first layer).
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
  "/cms(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") || "localhost:3000";
  const parsed = parseHostname(hostname);
  const { pathname } = req.nextUrl;

  // ── Reject malformed hostnames ────────────────────────────────────────────
  if (parsed.type === "invalid") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // ── Tenant site routes ────────────────────────────────────────────────────
  // Subdomain or custom domain → rewrite to the internal /site/[domain] handler.
  // Public routes — no Clerk auth required (content is public).
  if (parsed.type === "tenant_subdomain" || parsed.type === "custom_domain") {
    const tenantKey =
      parsed.type === "tenant_subdomain"
        ? parsed.subdomain!
        : parsed.fullHostname;

    const url = req.nextUrl.clone();
    url.pathname = `/site/${encodeURIComponent(tenantKey)}${pathname === "/" ? "" : pathname}`;

    const response = NextResponse.rewrite(url);
    response.headers.set("x-tenant-key", tenantKey);
    response.headers.set("x-tenant-type", parsed.type);
    return response;
  }

  // ── App subdomain: app.endexly.com ────────────────────────────────────────
  // Root visit on the app subdomain goes to /admin — not the marketing page.
  if (parsed.type === "app" && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // ── Protected platform routes ─────────────────────────────────────────────
  // auth.protect() redirects unauthenticated users to /sign-in (with a
  // redirect_url query param so Clerk sends them back after they log in).
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
