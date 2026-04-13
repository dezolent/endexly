import type { Block } from "payload";

export const TestimonialsBlock: Block = {
  slug: "testimonials",
  labels: { singular: "Testimonials", plural: "Testimonials Sections" },
  fields: [
    {
      name: "heading",
      type: "text",
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
          name: "quote",
          type: "textarea",
          required: true,
        },
        {
          name: "authorName",
          type: "text",
          required: true,
        },
        {
          name: "authorTitle",
          type: "text",
        },
        {
          name: "authorAvatar",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
  ],
};
