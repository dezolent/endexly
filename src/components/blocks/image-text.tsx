import { RichTextBlock } from "./rich-text";
import type { MediaType } from "./types";

type ImageTextBlockProps = {
  blockType: "imageText";
  imagePosition?: "left" | "right";
  image: MediaType;
  heading: string;
  body?: unknown;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  primaryColor?: string;
};

export function ImageTextBlock({
  imagePosition = "left",
  image,
  heading,
  body,
  ctaLabel,
  ctaUrl,
  primaryColor = "#2563eb",
}: ImageTextBlockProps) {
  const imgUrl = typeof image === "object" ? image.url : null;
  const imgAlt = typeof image === "object" ? (image.alt ?? heading) : heading;

  const textCol = (
    <div className="flex flex-col justify-center gap-6">
      <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
      {body ? (
        <RichTextBlock
          blockType="richText"
          content={body as never}
          maxWidth="full"
        />
      ) : null}
      {ctaLabel && ctaUrl && (
        <a
          href={ctaUrl}
          className="self-start inline-flex items-center px-6 py-3 rounded-lg text-white font-medium text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );

  const imgCol = (
    <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
      {imgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgUrl} alt={imgAlt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
    </div>
  );

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {imagePosition === "left" ? (
          <>
            {imgCol}
            {textCol}
          </>
        ) : (
          <>
            {textCol}
            {imgCol}
          </>
        )}
      </div>
    </section>
  );
}
