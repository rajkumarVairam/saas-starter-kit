"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Shield, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit", label: "Audit Log", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 flex-row gap-1 md:w-48 md:flex-col">
      <p className="hidden px-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider md:block">
        Admin
      </p>
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden md:block">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
