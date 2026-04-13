import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Slug must be lowercase alphanumeric with hyphens, no leading/trailing hyphens"
    ),
  timezone: z.string().max(100).optional().default("UTC"),
  region: z.string().max(50).optional().default("us-east-1"),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
    .optional(),
  status: z.enum(["active", "suspended", "archived"]).optional(),
  planCode: z.string().max(50).optional(),
  timezone: z.string().max(100).optional(),
  region: z.string().max(50).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
