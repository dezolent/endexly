import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  resolveSiteByHostname,
  buildLookupHostname,
} from "@/lib/tenant/resolver";
import { getNavMenu } from "@/lib/payload/queries";
import Link from "next/link";

// ── Sanitize helpers (shared with page renderers) ─────────────────────────────
function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}
function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const p = new URL(url);
    return p.protocol === "https:" || p.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}
function sanitizeColor(color: string | null | undefined): string {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return "#2563eb";
  return color;
}

type NavItem = {
  label: string;
  url: string;
  openInNewTab?: boolean;
};

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const hdrs = await headers();
  const tenantType = hdrs.get("x-tenant-type") || "tenant_subdomain";
  const hostname = buildLookupHostname(domain, tenantType);

  const resolved = await resolveSiteByHostname(hostname);
  if (!resolved) notFound();

  const { site, settings } = resolved;
  const primaryColor = sanitizeColor(settings?.primaryColor);
  const brandName = sanitizeText(settings?.brandName) || site.name;
  const logoUrl = sanitizeUrl(settings?.logoUrl);

  // Fetch header nav menu (best-effort — no nav is fine)
  const navMenu = await getNavMenu(site.id, "header").catch(() => null);
  const navItems: NavItem[] = navMenu?.items ?? [];

  // Default nav if no menu is configured
  const displayNav: NavItem[] =
    navItems.length > 0
      ? navItems
      : [
          { label: "Home", url: "/" },
          { label: "Blog", url: "/blog" },
        ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName} className="h-8 w-auto" />
            )}
            <span
              className="text-xl font-bold"
              style={{ color: primaryColor }}
            >
              {brandName}
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {displayNav.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Powered by Endexly</p>
        </div>
      </footer>
    </div>
  );
}
