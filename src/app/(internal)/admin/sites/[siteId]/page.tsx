import Link from "next/link";
import { notFound } from "next/navigation";
import { buildTenantUrl } from "@/lib/utils";
import {
  getSite,
} from "@/app/(internal)/admin/_actions/sites";
import {
  listDomains,
} from "@/app/(internal)/admin/_actions/domains";
import {
  listEnvironments,
} from "@/app/(internal)/admin/_actions/environments";
import {
  getSiteSettings,
} from "@/app/(internal)/admin/_actions/site-settings";
import {
  Badge,
  Card,
  DataTable,
  PageHeader,
} from "@/components/shared";
import type { Column } from "@/components/shared";
import { formatDate } from "@/lib/utils";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { InlineAddDomain } from "./_components/inline-add-domain";
import { InlineAddEnvironment } from "./_components/inline-add-environment";

// ─── Type helpers ────────────────────────────────────────────────────────────

type Site = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: string;
  platformMode: string;
  primaryDomain: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type Environment = {
  id: string;
  siteId: string;
  envCode: string;
  status: string;
  previewUrl: string | null;
  createdAt: Date | string;
};

type Domain = {
  id: string;
  siteId: string;
  hostname: string;
  isPrimary: boolean;
  dnsStatus: string;
  tlsStatus: string;
  createdAt: Date | string;
};

type SiteSettings = {
  id: string;
  siteId: string;
  brandName: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  defaultTitle: string | null;
  defaultDescription: string | null;
  homepageHeading: string | null;
};

// ─── Status variant helpers ───────────────────────────────────────────────────

function siteStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "paused":
      return "warning" as const;
    case "archived":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

function envStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "inactive":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function dnsStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function tlsStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

// ─── Column definitions ───────────────────────────────────────────────────────

const environmentColumns: Column<Environment>[] = [
  {
    key: "envCode",
    header: "Environment",
    render: (_v, row) => (
      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded capitalize">
        {row.envCode}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_v, row) => (
      <Badge variant={envStatusVariant(row.status)}>{row.status}</Badge>
    ),
  },
  {
    key: "previewUrl",
    header: "Preview URL",
    render: (_v, row) =>
      row.previewUrl ? (
        <a
          href={row.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-primary hover:underline truncate max-w-[280px] inline-block"
        >
          {row.previewUrl}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "createdAt",
    header: "Created",
    render: (_v, row) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

const domainColumns: Column<Domain>[] = [
  {
    key: "hostname",
    header: "Hostname",
    render: (_v, row) => (
      <a
        href={buildTenantUrl(row.hostname)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-primary hover:underline"
      >
        {row.hostname}
      </a>
    ),
  },
  {
    key: "isPrimary",
    header: "Primary",
    render: (_v, row) =>
      row.isPrimary ? (
        <Badge variant="success">Primary</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "dnsStatus",
    header: "DNS",
    render: (_v, row) => (
      <Badge variant={dnsStatusVariant(row.dnsStatus)}>{row.dnsStatus}</Badge>
    ),
  },
  {
    key: "tlsStatus",
    header: "TLS",
    render: (_v, row) => (
      <Badge variant={tlsStatusVariant(row.tlsStatus)}>{row.tlsStatus}</Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    render: (_v, row) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

// ─── Detail field helper ──────────────────────────────────────────────────────

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SiteDetailPageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { siteId } = await params;

  const [siteResult, environmentsResult, domainsResult, settingsResult] =
    await Promise.all([
      getSite(siteId),
      listEnvironments(siteId),
      listDomains(siteId),
      getSiteSettings(siteId),
    ]);

  if (!siteResult.success || !siteResult.data) {
    notFound();
  }

  const site = siteResult.data as Site;
  const environments: Environment[] =
    environmentsResult.success && environmentsResult.data
      ? (environmentsResult.data as Environment[])
      : [];
  const domains: Domain[] =
    domainsResult.success && domainsResult.data
      ? (domainsResult.data.data as Domain[])
      : [];
  const settings = settingsResult.success ? (settingsResult.data as SiteSettings | null) : null;

  const existingEnvCodes = environments.map((e) => e.envCode);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title={site.name}
        description={`/${site.slug}`}
        action={
          <Link
            href="/admin/sites"
            className="inline-flex items-center justify-center rounded-md h-9 px-4 text-sm font-medium border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
          >
            ← All Sites
          </Link>
        }
      />

      {/* Section 1: Site Info */}
      <Card title="Site Info">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
          <DetailField label="Name">{site.name}</DetailField>

          <DetailField label="Slug">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {site.slug}
            </span>
          </DetailField>

          <DetailField label="Status">
            <Badge variant={siteStatusVariant(site.status)}>{site.status}</Badge>
          </DetailField>

          <DetailField label="Platform Mode">
            <span className="capitalize">
              {site.platformMode.replace("_", " ")}
            </span>
          </DetailField>

          <DetailField label="Primary Domain">
            {site.primaryDomain ? (
              <a
                href={buildTenantUrl(site.primaryDomain)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary hover:underline"
              >
                {site.primaryDomain}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </DetailField>

          <DetailField label="Organization">
            <Link
              href={`/admin/organizations/${site.organizationId}`}
              className="font-mono text-xs text-primary hover:underline"
            >
              {site.organizationId}
            </Link>
          </DetailField>

          <DetailField label="Created">{formatDate(site.createdAt)}</DetailField>

          <DetailField label="Updated">{formatDate(site.updatedAt)}</DetailField>
        </div>
      </Card>

      {/* Section 2: Environments */}
      <Card title="Environments" description="Runtime environments for this site.">
        {!environmentsResult.success && (
          <p className="text-sm text-destructive mb-4">{environmentsResult.error}</p>
        )}
        <DataTable
          columns={environmentColumns}
          data={environments}
          emptyMessage="No environments configured."
        />
        <div className="mt-4 border-t border-border pt-4">
          <InlineAddEnvironment
            siteId={siteId}
            existingEnvCodes={existingEnvCodes}
          />
        </div>
      </Card>

      {/* Section 3: Domains */}
      <Card title="Domains" description="Hostnames attached to this site.">
        {!domainsResult.success && (
          <p className="text-sm text-destructive mb-4">{domainsResult.error}</p>
        )}
        <DataTable
          columns={domainColumns}
          data={domains}
          emptyMessage="No domains configured."
        />
        <div className="mt-4 border-t border-border pt-4">
          <InlineAddDomain siteId={siteId} />
        </div>
      </Card>

      {/* Section 4: Site Settings */}
      <Card
        title="Site Settings"
        description="Branding and content defaults for this site."
      >
        {!settingsResult.success && (
          <p className="text-sm text-destructive mb-4">{settingsResult.error}</p>
        )}
        <SiteSettingsForm
          settings={{
            siteId,
            brandName: settings?.brandName,
            primaryColor: settings?.primaryColor,
            logoUrl: settings?.logoUrl,
            defaultTitle: settings?.defaultTitle,
            defaultDescription: settings?.defaultDescription,
            homepageHeading: settings?.homepageHeading,
          }}
        />
      </Card>
    </div>
  );
}
