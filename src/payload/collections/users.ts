import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    description: "CMS users with access to the Payload admin panel.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Display Name",
    },
  ],
};
