import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    description: "Author profiles for blog posts.",
    defaultColumns: ["name", "siteId", "title"],
  },
  fields: [
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
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "title",
      type: "text",
      label: "Job Title / Role",
    },
    {
      name: "bio",
      type: "textarea",
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "Twitter / X", value: "twitter" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "GitHub", value: "github" },
            { label: "Website", value: "website" },
          ],
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
  ],
};
