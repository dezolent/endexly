"use client";

import type { MediaType } from "./types";

type HeroBlockProps = {
  blockType: "hero";
  variant?: "centered" | "split";
  heading: string;
  subheading?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
  backgroundImage?: MediaType | null;
  primaryColor?: string;
};

export function HeroBlock({
  variant = "centered",
  heading,
  subheading,
  ctaLabel,
  ctaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  backgroundImage,
  primaryColor = "#2563eb",
}: HeroBlockProps) {
  const bgUrl =
    backgroundImage && typeof backgroundImage === "object"
      ? backgroundImage.url
      : null;

  if (variant === "split") {
    return (
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              {heading}
            </h1>
            {subheading && (
              <p className="text-xl text-gray-600 mb-8">{subheading}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {ctaLabel && ctaUrl && (
                <a
                  href={ctaUrl}
                  className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {ctaLabel}
                </a>
              )}
              {secondaryCtaLabel && secondaryCtaUrl && (
                <a
                  href={secondaryCtaUrl}
                  className="inline-flex items-center px-6 py-3 rounded-lg border font-medium text-sm text-gray-700 hover:bg-gray-50"
                >
                  {secondaryCtaLabel}
                </a>
              )}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
            {bgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgUrl}
                alt={
                  backgroundImage && typeof backgroundImage === "object"
                    ? (backgroundImage.alt ?? heading)
                    : heading
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor: `${primaryColor}15` }}
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  // Centered variant
  return (
    <section
      className="relative py-24 text-center"
      style={
        bgUrl
          ? {
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {bgUrl && (
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      )}
      <div className="relative max-w-4xl mx-auto px-6">
        <h1
          className={`text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${bgUrl ? "text-white" : "text-gray-900"}`}
        >
          {heading}
        </h1>
        {subheading && (
          <p
            className={`text-xl max-w-2xl mx-auto mb-10 ${bgUrl ? "text-white/90" : "text-gray-600"}`}
          >
            {subheading}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {ctaLabel && ctaUrl && (
            <a
              href={ctaUrl}
              className="inline-flex items-center px-8 py-3.5 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              {ctaLabel}
            </a>
          )}
          {secondaryCtaLabel && secondaryCtaUrl && (
            <a
              href={secondaryCtaUrl}
              className={`inline-flex items-center px-8 py-3.5 rounded-lg border font-medium ${bgUrl ? "border-white text-white hover:bg-white/10" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              {secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
