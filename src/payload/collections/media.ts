import type { CollectionConfig } from "payload";
import path from "path";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    description: "Images and files uploaded for tenant sites.",
  },
  upload: {
    // Files are served from /uploads in development.
    // In production, replace with a cloud storage adapter (S3, Cloudinary, etc.)
    staticDir: path.resolve(process.cwd(), "public/uploads"),
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
      },
      {
        name: "hero",
        width: 1920,
        height: undefined, // preserve aspect ratio
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "siteId",
      type: "text",
      admin: {
        description: "Scope this asset to a specific site (optional).",
        position: "sidebar",
      },
      index: true,
    },
    {
      name: "alt",
      type: "text",
      label: "Alt Text",
      admin: {
        description: "Descriptive text for accessibility and SEO.",
      },
    },
    {
      name: "caption",
      type: "text",
    },
  ],
};
