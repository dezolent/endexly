import { listAuditEvents } from "@/app/(app)/(internal)/admin/_actions/audit";
import { DataTable, PageHeader } from "@/components/shared";
import type { Column } from "@/components/shared";
import { formatDate } from "@/lib/utils";

type AuditRow = {
  id: string;
  organizationId: string | null;
  actorType: string;
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
  organizationName: string | null;
};

const columns: Column<AuditRow>[] = [
  {
    key: "action",
    header: "Action",
    render: (_value, row) => (
      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
        {row.action}
      </span>
    ),
  },
  {
    key: "resourceType",
    header: "Resource Type",
    render: (_value, row) => (
      <span className="text-sm">{row.resourceType}</span>
    ),
  },
  {
    key: "resourceId",
    header: "Resource ID",
    render: (_value, row) =>
      row.resourceId ? (
        <span className="font-mono text-xs text-muted-foreground">
          {row.resourceId}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "actorId",
    header: "Actor",
    render: (_value, row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {row.actorType}
        </span>
        {row.actorId && (
          <span className="font-mono text-xs">{row.actorId}</span>
        )}
      </div>
    ),
  },
  {
    key: "organizationName",
    header: "Organization",
    render: (_value, row) =>
      row.organizationName ? (
        <span className="text-sm">{row.organizationName}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "createdAt",
    header: "Timestamp",
    render: (_value, row) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

export default async function AuditPage() {
  const result = await listAuditEvents();

  const events: AuditRow[] = result.success && result.data
    ? (result.data.data as AuditRow[])
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        description={
          result.success && result.data
            ? `${result.data.total} event${result.data.total === 1 ? "" : "s"} recorded`
            : undefined
        }
      />

      {!result.success && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}

      <DataTable
        columns={columns}
        data={events}
        emptyMessage="No audit events found."
      />
    </div>
  );
}
