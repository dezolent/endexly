import { notFound } from "next/navigation";
import { headers, draftMode } from "next/headers";
import type { Metadata } from "next";
import {
  resolveSiteByHostname,
  buildLookupHostname,
} from "@/lib/tenant/resolver";
import { getPageBySlug, listPostsBySite } from "@/lib/payload/queries";
import { BlockRenderer } from "@/components/blocks";

// ── Helpers (used by layout too — keep in sync) ───────────────────────────────

function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}
function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const p = new URL(url);
    return p.protocol === "https:" || p.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
function sanitizeColor(color: string | null | undefined): string {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return "#2563eb";
  return color;
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface TenantPageProps {
  params: Promise<{ domain: string }>;
}

async function resolveAndGetPage(domain: string) {
  const hdrs = await headers();
  const tenantType = hdrs.get("x-tenant-type") || "tenant_subdomain";
  const hostname = buildLookupHostname(domain, tenantType);
  const resolved = await resolveSiteByHostname(hostname);
  if (!resolved) return null;

  const { isEnabled: isDraft } = await draftMode();
  const page = await getPageBySlug(resolved.site.id, "/", isDraft).catch(
    () => null
  );
  return { resolved, page, isDraft };
}

export async function generateMetadata({
  params,
}: TenantPageProps): Promise<Metadata> {
  const { domain } = await params;
  const result = await resolveAndGetPage(domain);
  if (!result) return { title: "Site Not Found" };

  const { resolved, page } = result;
  const { site, settings } = resolved;

  // Payload page meta takes priority, then site settings
  const title =
    page?.meta?.title ||
    settings?.defaultTitle ||
    sanitizeText(settings?.brandName) ||
    site.name;
  const description =
    page?.meta?.description ||
    sanitizeText(settings?.defaultDescription) ||
    `Welcome to ${site.name}`;

  return { title, description };
}

export default async function TenantHomePage({ params }: TenantPageProps) {
  const { domain } = await params;
  const result = await resolveAndGetPage(domain);
  if (!result) notFound();

  const { resolved, page, isDraft } = result;
  const { site, settings } = resolved;

  const primaryColor = sanitizeColor(settings?.primaryColor);

  // ── Draft mode banner ────────────────────────────────────────────────────
  const DraftBanner = isDraft ? (
    <div className="sticky top-0 z-[100] bg-yellow-400 text-yellow-900 text-xs font-medium px-4 py-2 flex items-center justify-between">
      <span>🔍 Preview mode — viewing draft content</span>
      <a
        href="/api/disable-draft"
        className="underline hover:no-underline"
      >
        Exit preview
      </a>
    </div>
  ) : null;

  // ── Payload page (block-based) ────────────────────────────────────────────
  if (page?.layout?.length) {
    // Pre-fetch posts if any BlogListing block is in the layout
    const hasBlogListing = page.layout.some(
      (b: { blockType: string }) => b.blockType === "blogListing"
    );
    const posts = hasBlogListing
      ? (
          await listPostsBySite(site.id, {
            limit:
              (page.layout.find(
                (b: { blockType: string; limit?: number }) =>
                  b.blockType === "blogListing"
              )?.limit as number | undefined) ?? 3,
          })
        ).docs
      : [];

    return (
      <>
        {DraftBanner}
        <BlockRenderer
          blocks={page.layout}
          primaryColor={primaryColor}
          posts={posts.map((p) => ({
            id: String(p.id),
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt ?? null,
            publishedAt: p.publishedAt ?? null,
            coverImage:
              p.coverImage && typeof p.coverImage === "object"
                ? p.coverImage
                : null,
            author:
              p.author && typeof p.author === "object"
                ? { id: String(p.author.id), name: p.author.name }
                : null,
          }))}
        />
      </>
    );
  }

  // ── Static fallback (no Payload page configured yet) ─────────────────────
  const brandName = sanitizeText(settings?.brandName) || site.name;
  const heading =
    sanitizeText(settings?.homepageHeading) || `Welcome to ${site.name}`;
  const description =
    sanitizeText(settings?.defaultDescription) ||
    `${site.name} — powered by Endexly.`;
  const logoUrl = sanitizeUrl(settings?.logoUrl);

  return (
    <>
      {DraftBanner}
      {/* Hero */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={brandName}
              className="h-16 w-auto mx-auto mb-6"
            />
          )}
          <h1 className="text-5xl font-bold tracking-tight mb-6">{heading}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            {description}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Get Started
            </a>
            <a
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-lg border font-medium text-sm text-gray-700 hover:bg-gray-50"
            >
              Read the Blog
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
