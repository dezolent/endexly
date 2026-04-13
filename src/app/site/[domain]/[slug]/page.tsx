import { notFound } from "next/navigation";
import { headers, draftMode } from "next/headers";
import type { Metadata } from "next";
import {
  resolveSiteByHostname,
  buildLookupHostname,
} from "@/lib/tenant/resolver";
import { getPageBySlug, listPostsBySite } from "@/lib/payload/queries";
import { BlockRenderer } from "@/components/blocks";

function sanitizeColor(color: string | null | undefined): string {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return "#2563eb";
  return color;
}

interface ContentPageProps {
  params: Promise<{ domain: string; slug: string }>;
}

async function resolveAndGetPage(domain: string, slug: string) {
  const hdrs = await headers();
  const tenantType = hdrs.get("x-tenant-type") || "tenant_subdomain";
  const hostname = buildLookupHostname(domain, tenantType);

  const [resolved, { isEnabled: isDraft }] = await Promise.all([
    resolveSiteByHostname(hostname),
    draftMode(),
  ]);

  if (!resolved) return null;

  const page = await getPageBySlug(resolved.site.id, slug, isDraft).catch(
    () => null
  );
  if (!page) return null;

  return { resolved, page, isDraft };
}

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { domain, slug } = await params;
  const result = await resolveAndGetPage(domain, slug);
  if (!result) return { title: "Page Not Found" };

  const { resolved, page } = result;
  const { site, settings } = resolved;

  return {
    title:
      page.meta?.title ||
      page.title ||
      settings?.defaultTitle ||
      site.name,
    description:
      page.meta?.description || settings?.defaultDescription || undefined,
  };
}

export default async function TenantContentPage({ params }: ContentPageProps) {
  const { domain, slug } = await params;

  // Don't handle reserved paths — these are caught by sibling routes
  if (slug === "blog") notFound();

  const result = await resolveAndGetPage(domain, slug);
  if (!result) notFound();

  const { resolved, page, isDraft } = result;
  const { site, settings } = resolved;
  const primaryColor = sanitizeColor(settings?.primaryColor);

  // Pre-load posts for any BlogListing blocks
  const hasBlogListing = page.layout?.some(
    (b: { blockType: string }) => b.blockType === "blogListing"
  );
  const posts = hasBlogListing
    ? (
        await listPostsBySite(site.id, {
          limit:
            (page.layout?.find(
              (b: { blockType: string; limit?: number }) =>
                b.blockType === "blogListing"
            )?.limit as number | undefined) ?? 3,
        })
      ).docs
    : [];

  return (
    <>
      {isDraft && (
        <div className="sticky top-0 z-[100] bg-yellow-400 text-yellow-900 text-xs font-medium px-4 py-2 flex items-center justify-between">
          <span>🔍 Preview mode — viewing draft content</span>
          <a href="/api/disable-draft" className="underline hover:no-underline">
            Exit preview
          </a>
        </div>
      )}
      {page.layout?.length ? (
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
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
          <p className="text-gray-500">This page has no content blocks yet.</p>
        </div>
      )}
    </>
  );
}
