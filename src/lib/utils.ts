import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build a full URL for a stored hostname.
 * Uses http for localhost (local dev), https everywhere else.
 */
export function buildTenantUrl(hostname: string): string {
  const protocol = hostname.includes("localhost") ? "http" : "https";
  return `${protocol}://${hostname}`;
}

/**
 * Build a platform subdomain URL for a given org/site slug.
 * e.g. "acme-corp" → "http://acme-corp.endexly.localhost:3000"
 * Uses NEXT_PUBLIC_ROOT_DOMAIN, available on both server and client.
 */
export function buildSlugUrl(slug: string): string {
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "endexly.localhost:3000";
  return buildTenantUrl(`${slug}.${rootDomain}`);
}
