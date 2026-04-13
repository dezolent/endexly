import { z } from "zod";

export const createSiteSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  platformMode: z.enum(["managed", "self_service"]).optional().default("managed"),
});

export const updateSiteSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/).optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  platformMode: z.enum(["managed", "self_service"]).optional(),
});

// Hostname: standard DNS labels plus optional :port for local dev
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:\d{1,5})?$/;

export const createDomainSchema = z.object({
  siteId: z.string().uuid("Invalid site ID"),
  hostname: z
    .string()
    .min(3, "Hostname too short")
    .max(255)
    .transform((v) => v.toLowerCase().trim())
    .pipe(z.string().regex(HOSTNAME_RE, "Invalid hostname format")),
  isPrimary: z.boolean().optional().default(false),
});

export const createEnvironmentSchema = z.object({
  siteId: z.string().uuid("Invalid site ID"),
  envCode: z.enum(["production", "staging", "preview"]),
});

export const updateSiteSettingsSchema = z.object({
  siteId: z.string().uuid("Invalid site ID"),
  brandName: z.string().max(255).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .optional(),
  logoUrl: z
    .string()
    .max(500)
    .optional()
    .transform((v) => {
      // Empty or undefined → undefined (don't store empty strings)
      if (!v) return undefined;
      // Must be http(s)
      try {
        const url = new URL(v);
        if (url.protocol === "https:" || url.protocol === "http:") return v;
      } catch { /* invalid URL */ }
      return undefined;
    }),
  defaultTitle: z.string().max(255).optional(),
  defaultDescription: z.string().max(1000).optional(),
  homepageHeading: z.string().max(500).optional(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
