import type { Block } from "payload";

export const BlogListingBlock: Block = {
  slug: "blogListing",
  labels: { singular: "Blog Listing", plural: "Blog Listings" },
  fields: [
    {
      name: "heading",
      type: "text",
      defaultValue: "Latest Posts",
    },
    {
      name: "subheading",
      type: "text",
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: {
        description: "Number of posts to display (1–12)",
      },
    },
    {
      name: "showViewAllLink",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "viewAllLabel",
      type: "text",
      defaultValue: "View all posts",
    },
  ],
};
