import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    description: "Blog posts for tenant sites.",
    defaultColumns: ["title", "slug", "siteId", "status", "publishedAt"],
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

    // ── Content ──────────────────────────────────────────────────────────────
    {
      name: "excerpt",
      type: "textarea",
      admin: {
        description: "Short summary shown in blog listings.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "authors",
      hasMany: false,
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor(),
      required: true,
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
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
