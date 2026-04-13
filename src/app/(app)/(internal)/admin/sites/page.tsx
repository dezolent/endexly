import Link from "next/link";
import { listSites } from "@/app/(app)/(internal)/admin/_actions/sites";
import { Badge, DataTable, PageHeader } from "@/components/shared";
import type { Column } from "@/components/shared";
import { formatDate, buildTenantUrl } from "@/lib/utils";

type SiteRow = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string | null;
  status: string;
  platformMode: string;
  primaryDomain: string | null;
  slug: string;
  createdAt: Date | string;
};

function statusVariant(status: string) {
  switch (status) {
    case "active":    return "success" as const;
    case "paused":    return "warning" as const;
    case "archived":  return "destructive" as const;
    default:          return "default" as const;
  }
}

const columns: Column<SiteRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (_value, row) => (
      <Link
        href={`/admin/sites/${row.id}`}
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        {row.name}
      </Link>
    ),
  },
  {
    key: "organizationName",
    header: "Organization",
    render: (_value, row) =>
      row.organizationName ? (
        <span className="text-sm text-muted-foreground">
          {row.organizationName}
        </span>
      ) : (
        <span className="font-mono text-xs text-muted-foreground">
          {row.organizationId}
        </span>
      ),
  },
  {
    key: "status",
    header: "Status",
    render: (_value, row) => (
      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
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
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

export default async function SitesPage() {
  const result = await listSites();
  const sites: SiteRow[] =
    result.success && result.data ? (result.data.data as SiteRow[]) : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sites"
        description={
          result.success && result.data
            ? `${result.data.total} site${result.data.total === 1 ? "" : "s"}`
            : undefined
        }
        action={
          <Link
            href="/admin/sites/new"
            className="inline-flex items-center justify-center rounded-md h-9 px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            New Site
          </Link>
        }
      />

      {!result.success && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}

      <DataTable columns={columns} data={sites} emptyMessage="No sites found." />
    </div>
  );
}
