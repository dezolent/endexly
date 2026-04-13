import type { Block } from "payload";

export const CTABlock: Block = {
  slug: "cta",
  labels: { singular: "CTA", plural: "CTA Sections" },
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
      name: "primaryCtaLabel",
      type: "text",
    },
    {
      name: "primaryCtaUrl",
      type: "text",
    },
    {
      name: "secondaryCtaLabel",
      type: "text",
    },
    {
      name: "secondaryCtaUrl",
      type: "text",
    },
    {
      name: "variant",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Default (light background)", value: "default" },
        { label: "Primary (brand color background)", value: "primary" },
        { label: "Dark", value: "dark" },
      ],
    },
  ],
};
