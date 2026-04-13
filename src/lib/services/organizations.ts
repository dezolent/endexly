import { organizationRepo } from "@/lib/repositories/organizations";
import { logAuditEvent } from "@/lib/auth/audit";
import { requirePlatformAdmin } from "@/lib/auth/rbac";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
} from "@/lib/validators/organizations";

export const organizationService = {
  async list(opts?: { search?: string; limit?: number; offset?: number }) {
    await requirePlatformAdmin();
    return organizationRepo.findAll(opts);
  },

  async getById(id: string) {
    await requirePlatformAdmin();
    const org = await organizationRepo.findById(id);
    if (!org) throw new Error("Organization not found");
    return org;
  },

  async create(input: CreateOrganizationInput) {
    const auth = await requirePlatformAdmin();
    const validated = createOrganizationSchema.parse(input);

    // Check slug uniqueness
    const existing = await organizationRepo.findBySlug(validated.slug);
    if (existing) {
      throw new Error("An organization with this slug already exists");
    }

    const org = await organizationRepo.create(validated);

    await logAuditEvent({
      auth,
      organizationId: org.id,
      action: "organization.created",
      resourceType: "organization",
      resourceId: org.id,
      metadata: { name: org.name, slug: org.slug },
    });

    return org;
  },

  async update(id: string, input: UpdateOrganizationInput) {
    const auth = await requirePlatformAdmin();
    const validated = updateOrganizationSchema.parse(input);

    if (validated.slug) {
      const existing = await organizationRepo.findBySlug(validated.slug);
      if (existing && existing.id !== id) {
        throw new Error("An organization with this slug already exists");
      }
    }

    const org = await organizationRepo.update(id, validated);

    await logAuditEvent({
      auth,
      organizationId: org.id,
      action: "organization.updated",
      resourceType: "organization",
      resourceId: org.id,
      metadata: { changes: Object.keys(validated) },
    });

    return org;
  },
};
