import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import {
  resolveSiteByHostname,
  buildLookupHostname,
} from "@/lib/tenant/resolver";
import { listPostsBySite } from "@/lib/payload/queries";

function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}
function sanitizeColor(color: string | null | undefined): string {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return "#2563eb";
  return color;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

interface BlogIndexProps {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: BlogIndexProps): Promise<Metadata> {
  const { domain } = await params;
  const hdrs = await headers();
  const tenantType = hdrs.get("x-tenant-type") || "tenant_subdomain";
  const hostname = buildLookupHostname(domain, tenantType);
  const resolved = await resolveSiteByHostname(hostname);

  if (!resolved) return { title: "Blog Not Found" };

  const brandName =
    sanitizeText(resolved.settings?.brandName) || resolved.site.name;
  return {
    title: `Blog — ${brandName}`,
    description: `Latest posts from ${brandName}`,
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: BlogIndexProps) {
  const { domain } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const hdrs = await headers();
  const tenantType = hdrs.get("x-tenant-type") || "tenant_subdomain";
  const hostname = buildLookupHostname(domain, tenantType);
  const resolved = await resolveSiteByHostname(hostname);

  if (!resolved) notFound();

  const { site, settings } = resolved;
  const primaryColor = sanitizeColor(settings?.primaryColor);
  const brandName = sanitizeText(settings?.brandName) || site.name;

  const result = await listPostsBySite(site.id, {
    limit: 9,
    page: currentPage,
  }).catch(() => null);

  const posts = result?.docs ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-12">Latest from {brandName}</p>

      {posts.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">No posts published yet.</p>
          <p className="text-sm mt-2">Check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const imgUrl =
                post.coverImage && typeof post.coverImage === "object"
                  ? (post.coverImage as { url?: string }).url
                  : null;
              const authorName =
                post.author && typeof post.author === "object"
                  ? (post.author as { name: string }).name
                  : null;

              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {imgUrl && (
                    <div className="aspect-video bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <Link href={`/blog/${post.slug}`}>
                      <h2
                        className="font-semibold text-gray-900 hover:underline mb-2 line-clamp-2"
                        style={{ color: primaryColor }}
                      >
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                      {authorName && <span>{authorName}</span>}
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
