type CTABlockProps = {
  blockType: "cta";
  heading: string;
  subheading?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaUrl?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
  variant?: "default" | "primary" | "dark";
  primaryColor?: string;
};

export function CTABlock({
  heading,
  subheading,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  variant = "default",
  primaryColor = "#2563eb",
}: CTABlockProps) {
  const bgClass =
    variant === "primary"
      ? ""
      : variant === "dark"
        ? "bg-gray-900 text-white"
        : "bg-gray-50";

  const style =
    variant === "primary" ? { backgroundColor: primaryColor } : undefined;
  const headingColor =
    variant === "primary" || variant === "dark" ? "text-white" : "text-gray-900";
  const subtextColor =
    variant === "primary" || variant === "dark"
      ? "text-white/80"
      : "text-gray-600";

  return (
    <section className={`py-20 text-center ${bgClass}`} style={style}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${headingColor}`}>
          {heading}
        </h2>
        {subheading && (
          <p className={`text-lg mb-8 ${subtextColor}`}>{subheading}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {primaryCtaLabel && primaryCtaUrl && (
            <a
              href={primaryCtaUrl}
              className="inline-flex items-center px-8 py-3.5 rounded-lg font-medium text-sm"
              style={
                variant !== "primary"
                  ? { backgroundColor: primaryColor, color: "#fff" }
                  : {
                      backgroundColor: "#fff",
                      color: primaryColor,
                    }
              }
            >
              {primaryCtaLabel}
            </a>
          )}
          {secondaryCtaLabel && secondaryCtaUrl && (
            <a
              href={secondaryCtaUrl}
              className={`inline-flex items-center px-8 py-3.5 rounded-lg border font-medium text-sm ${
                variant === "primary" || variant === "dark"
                  ? "border-white text-white hover:bg-white/10"
                  : "border-gray-300 text-gray-700 hover:bg-white"
              }`}
            >
              {secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
