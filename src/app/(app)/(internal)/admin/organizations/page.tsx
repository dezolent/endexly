import Link from "next/link";
import { Plus } from "lucide-react";
import { listOrganizations } from "@/app/(app)/(internal)/admin/_actions/organizations";
import { Badge, Button, DataTable, PageHeader } from "@/components/shared";
import type { Column } from "@/components/shared";
import { formatDate, buildSlugUrl } from "@/lib/utils";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  planCode: string | null;
  createdAt: Date | string;
};

type BadgeVariant = "success" | "warning" | "destructive" | "default";

function statusVariant(status: string): BadgeVariant {
  switch (status) {
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

const columns: Column<OrgRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (_value, row) => (
      <Link
        href={`/admin/organizations/${row.id}`}
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
      <a
        href={buildSlugUrl(row.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-primary hover:underline"
      >
        {row.slug}
      </a>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_value, row) => (
      <Badge variant={statusVariant(row.status)}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "planCode",
    header: "Plan",
    render: (_value, row) =>
      row.planCode ? (
        <span className="text-sm capitalize">{row.planCode}</span>
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

export default async function OrganizationsPage() {
  const result = await listOrganizations();

  const organizations: OrgRow[] =
    result.success && result.data ? (result.data.data as OrgRow[]) : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organizations"
        description={
          result.success && result.data
            ? `${result.data.total} organization${result.data.total === 1 ? "" : "s"}`
            : undefined
        }
        action={
          <Link href="/admin/organizations/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          </Link>
        }
      />

      {!result.success && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}

      <DataTable
        columns={columns}
        data={organizations}
        emptyMessage="No organizations found."
      />
    </div>
  );
}
