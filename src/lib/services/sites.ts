import {
  siteRepo,
  domainRepo,
  environmentRepo,
  siteSettingsRepo,
} from "@/lib/repositories/sites";
import { logAuditEvent } from "@/lib/auth/audit";
import { requirePlatformAdmin } from "@/lib/auth/rbac";
import {
  createSiteSchema,
  updateSiteSchema,
  createDomainSchema,
  createEnvironmentSchema,
  updateSiteSettingsSchema,
  type CreateSiteInput,
  type UpdateSiteInput,
  type CreateDomainInput,
  type CreateEnvironmentInput,
  type UpdateSiteSettingsInput,
} from "@/lib/validators/sites";

export const siteService = {
  async list(opts?: {
    organizationId?: string;
    limit?: number;
    offset?: number;
  }) {
    await requirePlatformAdmin();
    return siteRepo.findAll(opts);
  },

  async getById(id: string) {
    await requirePlatformAdmin();
    const site = await siteRepo.findById(id);
    if (!site) throw new Error("Site not found");
    return site;
  },

  async create(input: CreateSiteInput) {
    const auth = await requirePlatformAdmin();
    const validated = createSiteSchema.parse(input);

    const site = await siteRepo.create(validated);

    // Auto-create production environment
    await environmentRepo.create({
      siteId: site.id,
      envCode: "production",
    });

    // Auto-create default site settings
    await siteSettingsRepo.upsert({
      siteId: site.id,
      brandName: site.name,
      defaultTitle: site.name,
    });

    await logAuditEvent({
      auth,
      organizationId: site.organizationId,
      action: "site.created",
      resourceType: "site",
      resourceId: site.id,
      metadata: { name: site.name, slug: site.slug },
    });

    return site;
  },

  async update(id: string, input: UpdateSiteInput) {
    const auth = await requirePlatformAdmin();
    const validated = updateSiteSchema.parse(input);

    const site = await siteRepo.update(id, validated);

    await logAuditEvent({
      auth,
      organizationId: site.organizationId,
      action: "site.updated",
      resourceType: "site",
      resourceId: site.id,
      metadata: { changes: Object.keys(validated) },
    });

    return site;
  },
};

export const domainService = {
  async list(opts?: { siteId?: string; limit?: number; offset?: number }) {
    await requirePlatformAdmin();
    return domainRepo.findAll(opts);
  },

  async create(input: CreateDomainInput) {
    const auth = await requirePlatformAdmin();
    const validated = createDomainSchema.parse(input);

    // Check hostname uniqueness
    const existing = await domainRepo.findByHostname(validated.hostname);
    if (existing) {
      throw new Error("This hostname is already registered");
    }

    // If setting as primary, clear existing primary
    if (validated.isPrimary) {
      await domainRepo.clearPrimary(validated.siteId);
    }

    const domain = await domainRepo.create(validated);

    // Get the site for audit context
    const site = await siteRepo.findById(validated.siteId);

    // Update site's primaryDomain if this is primary
    if (validated.isPrimary && site) {
      await siteRepo.update(site.id, { primaryDomain: validated.hostname });
    }

    await logAuditEvent({
      auth,
      organizationId: site?.organizationId ?? null,
      action: "domain.created",
      resourceType: "domain",
      resourceId: domain.id,
      metadata: { hostname: validated.hostname, siteId: validated.siteId },
    });

    return domain;
  },
};

export const environmentService = {
  async listBySite(siteId: string) {
    await requirePlatformAdmin();
    return environmentRepo.findBySiteId(siteId);
  },

  async create(input: CreateEnvironmentInput) {
    const auth = await requirePlatformAdmin();
    const validated = createEnvironmentSchema.parse(input);

    const env = await environmentRepo.create(validated);

    const site = await siteRepo.findById(validated.siteId);

    await logAuditEvent({
      auth,
      organizationId: site?.organizationId ?? null,
      action: "environment.created",
      resourceType: "site_environment",
      resourceId: env.id,
      metadata: { envCode: validated.envCode, siteId: validated.siteId },
    });

    return env;
  },
};

export const siteSettingsService = {
  async getBySiteId(siteId: string) {
    await requirePlatformAdmin();
    return siteSettingsRepo.findBySiteId(siteId);
  },

  async update(input: UpdateSiteSettingsInput) {
    const auth = await requirePlatformAdmin();
    const validated = updateSiteSettingsSchema.parse(input);

    const settings = await siteSettingsRepo.upsert(validated);

    const site = await siteRepo.findById(validated.siteId);

    await logAuditEvent({
      auth,
      organizationId: site?.organizationId ?? null,
      action: "site_settings.updated",
      resourceType: "site_settings",
      resourceId: settings.id,
      metadata: { siteId: validated.siteId, changes: Object.keys(validated) },
    });

    return settings;
  },
};
