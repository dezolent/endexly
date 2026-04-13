import Link from "next/link";
import { listDomains } from "@/app/(app)/(internal)/admin/_actions/domains";
import { Badge, DataTable, PageHeader } from "@/components/shared";
import type { Column } from "@/components/shared";
import { formatDate } from "@/lib/utils";

type DomainRow = {
  id: string;
  siteId: string;
  hostname: string;
  isPrimary: boolean;
  dnsStatus: string;
  tlsStatus: string;
  createdAt: Date | string;
  siteName: string | null;
  organizationName: string | null;
};

type BadgeVariant = "success" | "warning" | "destructive" | "default";

function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case "verified":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "default";
  }
}

const columns: Column<DomainRow>[] = [
  {
    key: "hostname",
    header: "Hostname",
    render: (_value, row) => (
      <span className="font-mono text-sm">{row.hostname}</span>
    ),
  },
  {
    key: "siteName",
    header: "Site",
    render: (_value, row) =>
      row.siteName ? (
        <Link
          href={`/admin/sites/${row.siteId}`}
          className="text-primary hover:underline"
        >
          {row.siteName}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "isPrimary",
    header: "Primary",
    render: (_value, row) =>
      row.isPrimary ? (
        <Badge variant="success">Primary</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
  },
  {
    key: "dnsStatus",
    header: "DNS Status",
    render: (_value, row) => (
      <Badge variant={statusVariant(row.dnsStatus)}>
        {row.dnsStatus}
      </Badge>
    ),
  },
  {
    key: "tlsStatus",
    header: "TLS Status",
    render: (_value, row) => (
      <Badge variant={statusVariant(row.tlsStatus)}>
        {row.tlsStatus}
      </Badge>
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

export default async function DomainsPage() {
  const result = await listDomains();

  const domains: DomainRow[] = result.success && result.data
    ? (result.data.data as DomainRow[])
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Domains"
        description={
          result.success && result.data
            ? `${result.data.total} domain${result.data.total === 1 ? "" : "s"} registered`
            : undefined
        }
      />

      {!result.success && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}

      <DataTable
        columns={columns}
        data={domains}
        emptyMessage="No domains found."
      />
    </div>
  );
}
