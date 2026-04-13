import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "centered",
      options: [
        { label: "Centered", value: "centered" },
        { label: "Split (text left, image right)", value: "split" },
      ],
    },
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
      name: "ctaLabel",
      type: "text",
    },
    {
      name: "ctaUrl",
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
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
    },
  ],
};
