import { db } from "@/lib/db";
import { domains, sites, siteSettings, organizations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface ResolvedSite {
  site: {
    id: string;
    name: string;
    slug: string;
    status: string;
    organizationId: string;
  };
  domain: {
    id: string;
    hostname: string;
    isPrimary: boolean;
  };
  organization: {
    id: string;
    slug: string;
    name: string;
  };
  settings: {
    brandName: string | null;
    primaryColor: string | null;
    logoUrl: string | null;
    defaultTitle: string | null;
    defaultDescription: string | null;
    homepageHeading: string | null;
  } | null;
}

/**
 * Resolve a hostname to a site record. Single query with left join for settings.
 * Checks both site.status and org.status are active.
 *
 * @param hostname - The full hostname to look up (e.g. "acme.endexly.com" or "custom.com")
 */
export async function resolveSiteByHostname(
  hostname: string
): Promise<ResolvedSite | null> {
  const normalized = hostname.toLowerCase().trim();
  if (!normalized || normalized.length > 255) return null;

  const result = await db
    .select({
      domain: {
        id: domains.id,
        hostname: domains.hostname,
        isPrimary: domains.isPrimary,
      },
      site: {
        id: sites.id,
        name: sites.name,
        slug: sites.slug,
        status: sites.status,
        organizationId: sites.organizationId,
      },
      organization: {
        id: organizations.id,
        slug: organizations.slug,
        name: organizations.name,
      },
      settings: {
        brandName: siteSettings.brandName,
        primaryColor: siteSettings.primaryColor,
        logoUrl: siteSettings.logoUrl,
        defaultTitle: siteSettings.defaultTitle,
        defaultDescription: siteSettings.defaultDescription,
        homepageHeading: siteSettings.homepageHeading,
      },
    })
    .from(domains)
    .innerJoin(sites, eq(domains.siteId, sites.id))
    .innerJoin(organizations, eq(sites.organizationId, organizations.id))
    .leftJoin(siteSettings, eq(siteSettings.siteId, sites.id))
    .where(
      and(
        eq(domains.hostname, normalized),
        eq(sites.status, "active"),
        eq(organizations.status, "active")
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];

  // Left join: Drizzle types the whole settings object as nullable.
  // If it's null or all fields are null, treat as "no settings".
  const s = row.settings;
  const hasSettings = s != null && (
    s.brandName !== null ||
    s.primaryColor !== null ||
    s.defaultTitle !== null ||
    s.homepageHeading !== null
  );

  return {
    site: row.site,
    domain: row.domain,
    organization: row.organization,
    settings: hasSettings ? s : null,
  };
}

/**
 * Build the full hostname that would be stored in the domains table
 * for a given tenant key (subdomain slug or custom domain).
 */
export function buildLookupHostname(tenantKey: string, tenantType: string): string {
  if (tenantType === "tenant_subdomain") {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "endexly.localhost:3000";
    return `${tenantKey}.${rootDomain}`.toLowerCase();
  }
  return tenantKey.toLowerCase();
}
