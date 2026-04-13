interface OrgDashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDashboardPage({ params }: OrgDashboardPageProps) {
  const { orgSlug } = await params;

  return (
    <div className="flex flex-1 items-center justify-center p-12 text-center">
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold text-foreground">
          Organization:{" "}
          <span className="text-primary">{orgSlug}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Dashboard coming soon.</p>
      </div>
    </div>
  );
}
