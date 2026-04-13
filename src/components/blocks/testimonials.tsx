import type { MediaType } from "./types";

type TestimonialItem = {
  quote: string;
  authorName: string;
  authorTitle?: string | null;
  authorAvatar?: MediaType | null;
};

type TestimonialsBlockProps = {
  blockType: "testimonials";
  heading?: string | null;
  subheading?: string | null;
  items: TestimonialItem[];
  primaryColor?: string;
};

export function TestimonialsBlock({
  heading,
  subheading,
  items,
  primaryColor = "#2563eb",
}: TestimonialsBlockProps) {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        {(heading || subheading) && (
          <div className="text-center mb-12">
            {heading && (
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const avatarUrl =
              item.authorAvatar && typeof item.authorAvatar === "object"
                ? item.authorAvatar.url
                : null;

            return (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4"
              >
                {/* Quote mark */}
                <div
                  className="text-3xl font-serif leading-none"
                  style={{ color: primaryColor }}
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <p className="text-gray-700 leading-relaxed flex-1">
                  {item.quote}
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={item.authorName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {item.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.authorName}
                    </p>
                    {item.authorTitle && (
                      <p className="text-xs text-gray-500">{item.authorTitle}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
