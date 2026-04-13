import { db } from "@/lib/db";
import { sites, siteEnvironments, domains, siteSettings } from "@/lib/db/schema";
import type {
  Site,
  NewSite,
  SiteEnvironment,
  NewSiteEnvironment,
  Domain,
  NewDomain,
  SiteSettings,
  NewSiteSettings,
} from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { organizations } from "@/lib/db/schema";

export const siteRepo = {
  async findAll(opts?: {
    organizationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: (Site & { organizationName: string | null })[];
    total: number;
  }> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    const conditions = opts?.organizationId
      ? eq(sites.organizationId, opts.organizationId)
      : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select({
          id: sites.id,
          organizationId: sites.organizationId,
          name: sites.name,
          slug: sites.slug,
          status: sites.status,
          platformMode: sites.platformMode,
          primaryDomain: sites.primaryDomain,
          config: sites.config,
          createdAt: sites.createdAt,
          updatedAt: sites.updatedAt,
          organizationName: organizations.name,
        })
        .from(sites)
        .leftJoin(organizations, eq(sites.organizationId, organizations.id))
        .where(conditions)
        .orderBy(desc(sites.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(sites)
        .where(conditions),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string): Promise<Site | null> {
    const result = await db
      .select()
      .from(sites)
      .where(eq(sites.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: NewSite): Promise<Site> {
    const result = await db.insert(sites).values(data).returning();
    return result[0];
  },

  async update(id: string, data: Partial<NewSite>): Promise<Site> {
    const result = await db
      .update(sites)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return result[0];
  },
};

export const environmentRepo = {
  async findBySiteId(siteId: string): Promise<SiteEnvironment[]> {
    return db
      .select()
      .from(siteEnvironments)
      .where(eq(siteEnvironments.siteId, siteId))
      .orderBy(siteEnvironments.envCode);
  },

  async create(data: NewSiteEnvironment): Promise<SiteEnvironment> {
    const result = await db
      .insert(siteEnvironments)
      .values(data)
      .returning();
    return result[0];
  },
};

export const domainRepo = {
  async findAll(opts?: {
    siteId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: (Domain & { siteName: string | null; organizationName: string | null })[];
    total: number;
  }> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    const conditions = opts?.siteId
      ? eq(domains.siteId, opts.siteId)
      : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select({
          id: domains.id,
          siteId: domains.siteId,
          hostname: domains.hostname,
          isPrimary: domains.isPrimary,
          dnsStatus: domains.dnsStatus,
          tlsStatus: domains.tlsStatus,
          lastCheckedAt: domains.lastCheckedAt,
          createdAt: domains.createdAt,
          siteName: sites.name,
          organizationName: organizations.name,
        })
        .from(domains)
        .leftJoin(sites, eq(domains.siteId, sites.id))
        .leftJoin(organizations, eq(sites.organizationId, organizations.id))
        .where(conditions)
        .orderBy(desc(domains.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(domains)
        .where(conditions),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findByHostname(hostname: string): Promise<Domain | null> {
    const result = await db
      .select()
      .from(domains)
      .where(eq(domains.hostname, hostname.toLowerCase()))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: NewDomain): Promise<Domain> {
    const result = await db
      .insert(domains)
      .values({ ...data, hostname: data.hostname.toLowerCase() })
      .returning();
    return result[0];
  },

  async clearPrimary(siteId: string): Promise<void> {
    await db
      .update(domains)
      .set({ isPrimary: false })
      .where(and(eq(domains.siteId, siteId), eq(domains.isPrimary, true)));
  },
};

export const siteSettingsRepo = {
  async findBySiteId(siteId: string): Promise<SiteSettings | null> {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.siteId, siteId))
      .limit(1);
    return result[0] ?? null;
  },

  async upsert(data: NewSiteSettings): Promise<SiteSettings> {
    const existing = await this.findBySiteId(data.siteId);
    if (existing) {
      const result = await db
        .update(siteSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteSettings.siteId, data.siteId))
        .returning();
      return result[0];
    }
    const result = await db.insert(siteSettings).values(data).returning();
    return result[0];
  },
};
