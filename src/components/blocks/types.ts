// Shared types for block render components.
// These mirror the Payload collection shapes without depending on payload-types.ts
// (which is auto-generated and may not exist before first build).

export type MediaType = {
  id: string;
  url?: string | null;
  alt?: string | null;
  filename?: string | null;
  width?: number | null;
  height?: number | null;
  thumbnailURL?: string | null;
};

export type SiteContext = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  settings?: {
    brandName?: string | null;
    primaryColor?: string | null;
    logoUrl?: string | null;
  } | null;
};
