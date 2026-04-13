type ContactCTABlockProps = {
  blockType: "contactCta";
  heading: string;
  subheading?: string | null;
  email?: string | null;
  phone?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  primaryColor?: string;
};

export function ContactCTABlock({
  heading,
  subheading,
  email,
  phone,
  ctaLabel = "Contact Us",
  ctaUrl = "/contact",
  primaryColor = "#2563eb",
}: ContactCTABlockProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
        {subheading && (
          <p className="text-lg text-gray-600 mb-8">{subheading}</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-gray-700 hover:underline"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-gray-700 hover:underline"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {phone}
            </a>
          )}
        </div>

        {ctaLabel && ctaUrl && (
          <a
            href={ctaUrl}
            className="inline-flex items-center px-8 py-3.5 rounded-lg text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
