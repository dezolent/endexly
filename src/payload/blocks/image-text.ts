import type { Block } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const ImageTextBlock: Block = {
  slug: "imageText",
  labels: { singular: "Image + Text", plural: "Image + Text Sections" },
  fields: [
    {
      name: "imagePosition",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Image left", value: "left" },
        { label: "Image right", value: "right" },
      ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "heading",
      type: "text",
      required: true,
    },
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor(),
    },
    {
      name: "ctaLabel",
      type: "text",
    },
    {
      name: "ctaUrl",
      type: "text",
    },
  ],
};
