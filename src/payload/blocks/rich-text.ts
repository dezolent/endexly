import type { Block } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Rich Text", plural: "Rich Text Blocks" },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor(),
      required: true,
    },
    {
      name: "maxWidth",
      type: "select",
      defaultValue: "normal",
      options: [
        { label: "Normal (768px)", value: "normal" },
        { label: "Wide (1024px)", value: "wide" },
        { label: "Full width", value: "full" },
      ],
    },
  ],
};
