/**
 * Hostname parsing and tenant resolution utilities.
 *
 * Supports:
 * - Platform subdomains: {slug}.endexly.com or {slug}.endexly.localhost
 * - Custom domains: fully-qualified hostname lookup
 * - App routes: app.endexly.com for admin/dashboard
 * - Root domain: endexly.com for marketing
 */

export interface ParsedHostname {
  type: "root" | "app" | "tenant_subdomain" | "custom_domain" | "invalid";
  subdomain?: string;
  fullHostname: string;
}

// RFC 1123 hostname pattern (with optional port)
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
const MAX_HOSTNAME_LENGTH = 255;

/**
 * Validate a hostname conforms to RFC 1123 (after port stripping).
 */
function isValidHostname(hostname: string): boolean {
  // Strip port for validation
  const host = hostname.includes(":") ? hostname.split(":")[0] : hostname;
  if (host.length === 0 || host.length > MAX_HOSTNAME_LENGTH) return false;
  return HOSTNAME_RE.test(host);
}

/**
 * Parse a hostname against the configured root domain.
 * ROOT_DOMAIN should be set to e.g. "endexly.localhost:3000" for dev
 * or "endexly.com" for production.
 */
export function parseHostname(hostname: string): ParsedHostname {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "endexly.localhost:3000";
  const normalizedHost = hostname.toLowerCase().trim();

  // Validate hostname format
  if (!isValidHostname(normalizedHost)) {
    return { type: "invalid", fullHostname: hostname };
  }

  // Exact root domain match → marketing
  if (normalizedHost === rootDomain) {
    return { type: "root", fullHostname: hostname };
  }

  // App subdomain → admin/dashboard
  if (normalizedHost === `app.${rootDomain}`) {
    return { type: "app", fullHostname: hostname };
  }

  // Tenant subdomain: {slug}.{rootDomain}
  if (normalizedHost.endsWith(`.${rootDomain}`)) {
    const subdomain = normalizedHost.replace(`.${rootDomain}`, "");
    // Only single-level subdomains with valid slug chars
    if (subdomain && !subdomain.includes(".") && /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(subdomain)) {
      return {
        type: "tenant_subdomain",
        subdomain,
        fullHostname: hostname,
      };
    }
  }

  // Everything else is treated as a potential custom domain
  return { type: "custom_domain", fullHostname: hostname };
}

/**
 * Check if the current hostname should serve the platform app
 * (admin panel, customer dashboard, API routes).
 */
export function isPlatformHost(hostname: string): boolean {
  const parsed = parseHostname(hostname);
  return parsed.type === "root" || parsed.type === "app";
}

/**
 * Check if the current hostname should serve a tenant site.
 */
export function isTenantHost(hostname: string): boolean {
  const parsed = parseHostname(hostname);
  return parsed.type === "tenant_subdomain" || parsed.type === "custom_domain";
}
