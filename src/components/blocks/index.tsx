import React from "react";
import { HeroBlock } from "./hero";
import { RichTextBlock } from "./rich-text";
import { FeaturesBlock } from "./features";
import { CTABlock } from "./cta";
import { ImageTextBlock } from "./image-text";
import { TestimonialsBlock } from "./testimonials";
import { FAQBlock } from "./faq";
import { BlogListingBlock } from "./blog-listing";
import { ContactCTABlock } from "./contact-cta";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = Record<string, any> & { blockType: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any;

type BlockRendererProps = {
  blocks: Block[];
  primaryColor?: string;
  /** Pre-loaded posts for BlogListing blocks (populated by the page server component) */
  posts?: React.ComponentProps<typeof BlogListingBlock>["posts"];
};

export function BlockRenderer({
  blocks,
  primaryColor = "#2563eb",
  posts = [],
}: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, i) => {
        const shared = { primaryColor };
        const b = block as AnyProps;
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={i} {...b} {...shared} />;
          case "richText":
            return <RichTextBlock key={i} {...b} />;
          case "features":
            return <FeaturesBlock key={i} {...b} {...shared} />;
          case "cta":
            return <CTABlock key={i} {...b} {...shared} />;
          case "imageText":
            return <ImageTextBlock key={i} {...b} {...shared} />;
          case "testimonials":
            return <TestimonialsBlock key={i} {...b} {...shared} />;
          case "faq":
            return <FAQBlock key={i} {...b} {...shared} />;
          case "blogListing":
            return (
              <BlogListingBlock key={i} {...b} {...shared} posts={posts} />
            );
          case "contactCta":
            return <ContactCTABlock key={i} {...b} {...shared} />;
          default:
            // Unknown block — skip gracefully in production
            if (process.env.NODE_ENV === "development") {
              console.warn(`[BlockRenderer] Unknown blockType: "${block.blockType}"`);
            }
            return null;
        }
      })}
    </>
  );
}

// Named re-exports for direct use
export {
  HeroBlock,
  RichTextBlock,
  FeaturesBlock,
  CTABlock,
  ImageTextBlock,
  TestimonialsBlock,
  FAQBlock,
  BlogListingBlock,
  ContactCTABlock,
};
export type { BlockRendererProps };
