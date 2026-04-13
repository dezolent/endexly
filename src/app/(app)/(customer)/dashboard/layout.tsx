import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-background flex items-center justify-between px-6">
        <span className="text-lg font-semibold text-foreground">
          Endexly Dashboard
        </span>
        <UserButton />
      </header>
      <main className="flex flex-1 flex-col bg-muted/10">{children}</main>
    </div>
  );
}
