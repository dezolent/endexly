import type { Block } from "payload";

export const FAQBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQ Sections" },
  fields: [
    {
      name: "heading",
      type: "text",
      defaultValue: "Frequently Asked Questions",
    },
    {
      name: "subheading",
      type: "text",
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "question",
          type: "text",
          required: true,
        },
        {
          name: "answer",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};
