import { notFound } from "next/navigation";
import { headers, draftMode } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import {
  resolveSiteByHostname,
  buildLookupHostname,
} from "@/lib/tenant/resolver";
import { getPostBySlug } from "@/lib/payload/queries";
import { RichTextBlock } from "@/components/blocks/rich-text";

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

interface BlogPostPageProps {
  params: Promise<{ domain: string; postSlug: string }>;
}

async function resolveAndGetPost(domain: string, postSlug: string) {
  const hdrs = await headers();
  const tenantType = hdrs.get("x-tenant-type") || "tenant_subdomain";
  const hostname = buildLookupHostname(domain, tenantType);

  const [resolved, { isEnabled: isDraft }] = await Promise.all([
    resolveSiteByHostname(hostname),
    draftMode(),
  ]);

  if (!resolved) return null;

  const post = await getPostBySlug(resolved.site.id, postSlug, isDraft).catch(
    () => null
  );
  if (!post) return null;

  return { resolved, post, isDraft };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { domain, postSlug } = await params;
  const result = await resolveAndGetPost(domain, postSlug);
  if (!result) return { title: "Post Not Found" };

  const { resolved, post } = result;
  const { settings } = resolved;

  const ogImage =
    post.meta?.image && typeof post.meta.image === "object"
      ? { url: (post.meta.image as { url?: string }).url ?? "" }
      : post.coverImage && typeof post.coverImage === "object"
        ? { url: (post.coverImage as { url?: string }).url ?? "" }
        : undefined;

  return {
    title: post.meta?.title || post.title,
    description:
      post.meta?.description || post.excerpt || settings?.defaultDescription,
    openGraph: ogImage
      ? { images: [ogImage] }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { domain, postSlug } = await params;
  const result = await resolveAndGetPost(domain, postSlug);
  if (!result) notFound();

  const { resolved, post, isDraft } = result;
  const { settings } = resolved;

  const primaryColor = sanitizeColor(settings?.primaryColor);
  const coverImgUrl =
    post.coverImage && typeof post.coverImage === "object"
      ? (post.coverImage as { url?: string }).url
      : null;
  const authorName =
    post.author && typeof post.author === "object"
      ? (post.author as { name: string }).name
      : null;
  const authorTitle =
    post.author && typeof post.author === "object"
      ? (post.author as { title?: string }).title
      : null;
  const authorAvatar =
    post.author && typeof post.author === "object"
      ? (post.author as { avatar?: { url?: string } }).avatar?.url
      : null;

  const tags: string[] = (post.tags ?? []).map(
    (t: { tag: string }) => t.tag
  );

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

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600">
            Home
          </Link>
          {" / "}
          <Link href="/blog" className="hover:text-gray-600">
            Blog
          </Link>
          {" / "}
          <span className="text-gray-600">{post.title}</span>
        </nav>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta line */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          {authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorAvatar}
              alt={authorName ?? "Author"}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : authorName ? (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
          ) : null}
          <div className="flex flex-col text-sm">
            {authorName && (
              <span className="font-medium text-gray-800">
                {authorName}
                {authorTitle && (
                  <span className="font-normal text-gray-500">
                    {" "}
                    · {sanitizeText(authorTitle)}
                  </span>
                )}
              </span>
            )}
            {post.publishedAt && (
              <span className="text-gray-400">
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Cover image */}
        {coverImgUrl && (
          <div className="rounded-xl overflow-hidden mb-10 aspect-video bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImgUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Body */}
        <div className="text-gray-800">
          <RichTextBlock
            blockType="richText"
            content={post.content}
            maxWidth="full"
          />
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </>
  );
}
