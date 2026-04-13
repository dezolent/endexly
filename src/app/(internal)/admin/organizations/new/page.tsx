import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader, Card } from "@/components/shared";
import { CreateOrganizationForm } from "@/components/admin/create-organization-form";

export default function NewOrganizationPage() {
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
        title="Create Organization"
        description="Provision a new organization on the platform."
      />

      <div className="max-w-lg">
        <Card>
          <CreateOrganizationForm />
        </Card>
      </div>
    </div>
  );
}
