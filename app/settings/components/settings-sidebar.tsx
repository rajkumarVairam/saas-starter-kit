"use client";

import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import {
  Bell,
  Building2,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LucideIcon,
  Monitor,
  Palette,
  Shield,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type NavItem =
  | {
      type: "link";
      href: string;
      label: string;
      icon?: LucideIcon;
      isExternal?: boolean;
    }
  | { type: "separator"; id: string }
  | { type: "heading"; id: string; label: string };

const BASE_NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { type: "separator", id: "profile-sep" },

  { type: "heading", id: "account-heading", label: "Account" },
  { type: "link", href: "/settings/profile", label: "Profile", icon: User },
  { type: "link", href: "/settings/account", label: "Account", icon: UserCog },
  { type: "link", href: "/settings/security", label: "Security", icon: Shield },
  { type: "separator", id: "workspace-sep" },

  { type: "heading", id: "workspace-heading", label: "Workspace" },
  { type: "link", href: "/settings/organization", label: "Organization", icon: Building2 },
  { type: "link", href: "/settings/themes", label: "Appearance", icon: Palette },
  { type: "separator", id: "billing-sep" },

  { type: "heading", id: "billing-heading", label: "Billing & Prefs" },
  { type: "link", href: "/settings/billing", label: "Billing", icon: CreditCard },
  { type: "link", href: "/settings/notifications", label: "Notifications", icon: Bell },
  { type: "link", href: "/settings/sessions", label: "Sessions", icon: Monitor },
];

const getSubscriptionNavItems = (): NavItem[] => [
  {
    type: "link",
    href: "/settings/portal",
    label: "Manage Subscription",
    icon: CreditCard,
    isExternal: true,
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();
  const { subscriptionStatus } = useSubscription();

  const navItems = useMemo(() => {
    if (subscriptionStatus?.isSubscribed) {
      return [...BASE_NAV_ITEMS, ...getSubscriptionNavItems()];
    }
    return BASE_NAV_ITEMS;
  }, [subscriptionStatus?.isSubscribed]);

  return (
    <aside className="w-56 shrink-0">
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          if (item.type === "separator") {
            return <Separator key={item.id} className="my-2" />;
          }
          if (item.type === "heading") {
            return (
              <p
                key={item.id}
                className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {item.label}
              </p>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="truncate">{item.label}</span>
              {item.isExternal && <ExternalLink className="ml-auto size-3.5 shrink-0" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
