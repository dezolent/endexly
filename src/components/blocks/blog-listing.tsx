import Link from "next/link";
import type { MediaType } from "./types";

type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  coverImage?: MediaType | null;
  author?: {
    id: string;
    name: string;
  } | null;
};

type BlogListingBlockProps = {
  blockType: "blogListing";
  heading?: string | null;
  subheading?: string | null;
  showViewAllLink?: boolean;
  viewAllLabel?: string | null;
  // Populated at render time — not a Payload field
  posts?: PostSummary[];
  primaryColor?: string;
};

function formatDate(iso: string): string {
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

export function BlogListingBlock({
  heading = "Latest Posts",
  subheading,
  showViewAllLink = true,
  viewAllLabel = "View all posts",
  posts = [],
  primaryColor = "#2563eb",
}: BlogListingBlockProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            {heading && (
              <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
            )}
            {subheading && (
              <p className="mt-2 text-gray-600">{subheading}</p>
            )}
          </div>
          {showViewAllLink && (
            <Link
              href="/blog"
              className="text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-sm">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const imgUrl =
                post.coverImage && typeof post.coverImage === "object"
                  ? post.coverImage.url
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
                      <h3
                        className="font-semibold text-gray-900 hover:underline mb-2 line-clamp-2"
                        style={{ color: "inherit" }}
                      >
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      {post.author && <span>{post.author.name}</span>}
                      {post.publishedAt && (
                        <span>{formatDate(post.publishedAt)}</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
