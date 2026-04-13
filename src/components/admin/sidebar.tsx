"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Globe,
  LayoutDashboard,
  FileText,
  Shield,
  MonitorDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    label: "Sites",
    href: "/admin/sites",
    icon: MonitorDot,
  },
  {
    label: "Domains",
    href: "/admin/domains",
    icon: Globe,
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-muted/30 flex flex-col min-h-screen">
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Endexly Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        Platform Admin
      </div>
    </aside>
  );
}
