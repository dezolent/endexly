import Link from "next/link";
import { Building2, Globe, MonitorDot, ArrowRight } from "lucide-react";
import { PageHeader, Card } from "@/components/shared";
import { listOrganizations } from "@/app/(internal)/admin/_actions/organizations";
import { listSites } from "@/app/(internal)/admin/_actions/sites";
import { listDomains } from "@/app/(internal)/admin/_actions/domains";

export default async function AdminDashboardPage() {
  const [orgsResult, sitesResult, domainsResult] = await Promise.all([
    listOrganizations(),
    listSites(),
    listDomains(),
  ]);

  const orgCount = orgsResult.success && orgsResult.data ? orgsResult.data.total : null;
  const siteCount = sitesResult.success && sitesResult.data ? sitesResult.data.total : null;
  const domainCount = domainsResult.success && domainsResult.data ? domainsResult.data.total : null;

  const stats = [
    {
      label: "Organizations",
      count: orgCount,
      icon: Building2,
      href: "/admin/organizations",
      description: "Manage tenants and their plans",
    },
    {
      label: "Sites",
      count: siteCount,
      icon: MonitorDot,
      href: "/admin/sites",
      description: "View and configure all sites",
    },
    {
      label: "Domains",
      count: domainCount,
      icon: Globe,
      href: "/admin/domains",
      description: "Monitor DNS and TLS status",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and quick access to admin tools."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, count, icon: Icon, href, description }) => (
          <Link key={href} href={href} className="group">
            <Card className="flex flex-col gap-4 h-full transition-colors hover:border-primary/50">
              <div className="flex items-start justify-between">
                <div className="rounded-md bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {count === null ? "—" : count.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card title="Quick Links" description="Frequently used admin actions">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/organizations/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Building2 className="h-3.5 w-3.5" />
            New Organization
          </Link>
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            View Audit Log
          </Link>
          <Link
            href="/admin/domains"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Globe className="h-3.5 w-3.5" />
            Domains
          </Link>
        </div>
      </Card>
    </div>
  );
}
