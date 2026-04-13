import type { Block } from "payload";

export const ContactCTABlock: Block = {
  slug: "contactCta",
  labels: { singular: "Contact CTA", plural: "Contact CTAs" },
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
    },
    {
      name: "subheading",
      type: "text",
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "ctaLabel",
      type: "text",
      defaultValue: "Contact Us",
    },
    {
      name: "ctaUrl",
      type: "text",
      defaultValue: "/contact",
    },
  ],
};
