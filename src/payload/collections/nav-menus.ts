import type { CollectionConfig } from "payload";

export const NavMenus: CollectionConfig = {
  slug: "navMenus",
  admin: {
    useAsTitle: "name",
    description: "Navigation menus for tenant sites.",
    defaultColumns: ["name", "siteId", "location"],
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
      admin: {
        description: "Internal label, e.g. 'Main Navigation', 'Footer Links'.",
      },
    },
    {
      name: "location",
      type: "select",
      required: true,
      options: [
        { label: "Header", value: "header" },
        { label: "Footer", value: "footer" },
        { label: "Sidebar", value: "sidebar" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
          admin: {
            description: "Use relative paths (e.g. /about) or full URLs.",
          },
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "children",
          type: "array",
          label: "Sub-items (one level deep)",
          fields: [
            {
              name: "label",
              type: "text",
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
    },
  ],
};
