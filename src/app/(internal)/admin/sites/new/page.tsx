import { listOrganizations } from "@/app/(internal)/admin/_actions/organizations";
import { Card, PageHeader } from "@/components/shared";
import { CreateSiteForm } from "@/components/admin/create-site-form";

interface NewSitePageProps {
  searchParams: Promise<{ orgId?: string }>;
}

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const { orgId } = await searchParams;

  const orgsResult = await listOrganizations();

  const organizations =
    orgsResult.success && orgsResult.data
      ? (orgsResult.data.data as { id: string; name: string }[])
      : [];

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <PageHeader
        title="Create Site"
        description="Set up a new site within an organization."
      />

      {!orgsResult.success && (
        <p className="text-sm text-destructive">{orgsResult.error}</p>
      )}

      <Card>
        <CreateSiteForm organizations={organizations} defaultOrgId={orgId} />
      </Card>
    </div>
  );
}
