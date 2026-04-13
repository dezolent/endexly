import type { CollectionConfig } from "payload";
import { HeroBlock } from "../blocks/hero";
import { RichTextBlock } from "../blocks/rich-text";
import { FeaturesBlock } from "../blocks/features";
import { CTABlock } from "../blocks/cta";
import { ImageTextBlock } from "../blocks/image-text";
import { TestimonialsBlock } from "../blocks/testimonials";
import { FAQBlock } from "../blocks/faq";
import { BlogListingBlock } from "../blocks/blog-listing";
import { ContactCTABlock } from "../blocks/contact-cta";

export const Pages: CollectionConfig = {
  slug: "pages",
  hooks: {
    // Normalize slug to always have a leading slash so URL routing is predictable.
    // "/" stays as-is; "about" becomes "/about"; "/about" is unchanged.
    beforeChange: [
      ({ data }) => {
        if (typeof data.slug === "string" && data.slug !== "/") {
          data.slug = data.slug.startsWith("/") ? data.slug : `/${data.slug}`;
        }
        return data;
      },
    ],
  },
  admin: {
    useAsTitle: "title",
    description: "Content pages for tenant sites, built with the block editor.",
    defaultColumns: ["title", "slug", "siteId", "status", "updatedAt"],
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    {
      name: "siteId",
      type: "text",
      required: true,
      admin: {
        description: "The site ID from the Endexly control plane (sites.id).",
        position: "sidebar",
      },
      index: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      admin: {
        description: 'URL path for this page. Use "/" for the homepage.',
      },
      index: true,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },

    // ── Page builder ─────────────────────────────────────────────────────────
    {
      name: "layout",
      type: "blocks",
      blocks: [
        HeroBlock,
        RichTextBlock,
        FeaturesBlock,
        CTABlock,
        ImageTextBlock,
        TestimonialsBlock,
        FAQBlock,
        BlogListingBlock,
        ContactCTABlock,
      ],
    },

    // ── SEO ──────────────────────────────────────────────────────────────────
    {
      name: "meta",
      type: "group",
      label: "SEO",
      admin: { position: "sidebar" },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Meta Title",
        },
        {
          name: "description",
          type: "textarea",
          label: "Meta Description",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "OG Image",
        },
      ],
    },
  ],
};
