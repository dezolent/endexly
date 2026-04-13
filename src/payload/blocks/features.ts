import type { Block } from "payload";

export const FeaturesBlock: Block = {
  slug: "features",
  labels: { singular: "Features", plural: "Features Sections" },
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
      name: "columns",
      type: "select",
      defaultValue: "3",
      options: [
        { label: "2 columns", value: "2" },
        { label: "3 columns", value: "3" },
        { label: "4 columns", value: "4" },
      ],
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "icon",
          type: "text",
          admin: {
            description: "Lucide icon name (e.g. Globe, Search, Bot)",
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};
