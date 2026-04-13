export default function DashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-12 text-center">
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome to your dashboard.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select an organization to get started.
        </p>
      </div>
    </div>
  );
}
