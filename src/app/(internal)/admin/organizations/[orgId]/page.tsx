import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { getOrganization } from "@/app/(internal)/admin/_actions/organizations";
import { listSites } from "@/app/(internal)/admin/_actions/sites";
import { Badge, Button, Card, DataTable, PageHeader } from "@/components/shared";
import type { Column } from "@/components/shared";
import { formatDate, buildSlugUrl, buildTenantUrl } from "@/lib/utils";

type OrgStatus = "active" | "suspended" | "archived";
type BadgeVariant = "success" | "warning" | "destructive" | "default";

type SiteRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  platformMode: string;
  primaryDomain: string | null;
  createdAt: Date | string;
};

function orgStatusVariant(status: string): BadgeVariant {
  switch (status as OrgStatus) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    case "archived":
      return "destructive";
    default:
      return "default";
  }
}

function siteStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    case "archived":
      return "destructive";
    default:
      return "default";
  }
}

const siteColumns: Column<SiteRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (_value, row) => (
      <Link
        href={`/admin/sites/${row.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.name}
      </Link>
    ),
  },
  {
    key: "slug",
    header: "Slug",
    render: (_value, row) => (
      <span className="font-mono text-xs text-muted-foreground">{row.slug}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_value, row) => (
      <Badge variant={siteStatusVariant(row.status)}>{row.status}</Badge>
    ),
  },
  {
    key: "platformMode",
    header: "Mode",
    render: (_value, row) => (
      <span className="text-sm capitalize">{row.platformMode.replace("_", " ")}</span>
    ),
  },
  {
    key: "primaryDomain",
    header: "Primary Domain",
    render: (_value, row) =>
      row.primaryDomain ? (
        <a
          href={buildTenantUrl(row.primaryDomain)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-primary hover:underline"
        >
          {row.primaryDomain}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "createdAt",
    header: "Created",
    render: (_value, row) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

type OrgDetailPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgDetailPage({ params }: OrgDetailPageProps) {
  const { orgId } = await params;

  const [orgResult, sitesResult] = await Promise.all([
    getOrganization(orgId),
    listSites(orgId),
  ]);

  if (!orgResult.success || !orgResult.data) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Organizations
        </Link>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-8 text-center">
          <p className="text-sm font-medium text-destructive">
            {orgResult.error ?? "Organization not found."}
          </p>
          <Link
            href="/admin/organizations"
            className="mt-4 inline-flex text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Return to organizations
          </Link>
        </div>
      </div>
    );
  }

  const org = orgResult.data as {
    id: string;
    name: string;
    slug: string;
    status: string;
    planCode: string | null;
    timezone: string | null;
    region: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };

  const sites: SiteRow[] =
    sitesResult.success && sitesResult.data
      ? (sitesResult.data.data as SiteRow[])
      : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Organizations
        </Link>
      </div>

      <PageHeader
        title={org.name}
        description={`/${org.slug}`}
        action={
          <Badge variant={orgStatusVariant(org.status)} className="text-sm px-3 py-1">
            {org.status}
          </Badge>
        }
      />

      {/* Org details card */}
      <Card title="Organization Details">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Name
            </dt>
            <dd className="text-sm text-foreground">{org.name}</dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Slug
            </dt>
            <dd>
              <a
                href={buildSlugUrl(org.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-primary hover:underline"
              >
                {org.slug}
              </a>
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </dt>
            <dd>
              <Badge variant={orgStatusVariant(org.status)}>{org.status}</Badge>
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Plan
            </dt>
            <dd className="text-sm text-foreground capitalize">
              {org.planCode ?? "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Timezone
            </dt>
            <dd className="font-mono text-sm text-foreground">
              {org.timezone ?? "UTC"}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Region
            </dt>
            <dd className="font-mono text-sm text-foreground">
              {org.region ?? "us-east-1"}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Created
            </dt>
            <dd className="text-sm text-muted-foreground">
              {formatDate(org.createdAt)}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Last Updated
            </dt>
            <dd className="text-sm text-muted-foreground">
              {formatDate(org.updatedAt)}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Sites card */}
      <Card
        title="Sites"
        description={
          sitesResult.success && sitesResult.data
            ? `${sitesResult.data.total} site${sitesResult.data.total === 1 ? "" : "s"}`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Link href={`/admin/sites/new?orgId=${org.id}`}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Create Site
              </Button>
            </Link>
          </div>

          {!sitesResult.success && (
            <p className="text-sm text-destructive">{sitesResult.error}</p>
          )}

          <DataTable
            columns={siteColumns}
            data={sites}
            emptyMessage="No sites for this organization."
          />
        </div>
      </Card>
    </div>
  );
}
