import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { theme, aiUsage, auditLog } from "@/db/schema";
import { eq, count, desc, gte } from "drizzle-orm";
import { getMyActiveSubscription } from "@/lib/subscription";
import { siteConfig } from "@/config/site";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity,
  ArrowRight,
  CreditCard,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatAction(action: string): string {
  return action.replace(/\./g, " › ").replace(/_/g, " ");
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const userId = session.user.id;

  // Parallel data fetch
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [themeCount, aiRequestCount, recentActivity, subscription] = await Promise.all([
    db.select({ n: count() }).from(theme).where(eq(theme.userId, userId)),
    db
      .select({ n: count() })
      .from(aiUsage)
      .where(gte(aiUsage.createdAt, thirtyDaysAgo)),
    db
      .select({ action: auditLog.action, createdAt: auditLog.createdAt })
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(5),
    getMyActiveSubscription(userId),
  ]);

  const isSubscribed = !!subscription;
  const themes = themeCount[0]?.n ?? 0;
  const aiRequests = aiRequestCount[0]?.n ?? 0;

  const name = session.user.name ?? session.user.email;
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const quickActions = [
    {
      label: "Edit Profile",
      description: "Update your name, avatar and email",
      href: "/settings/profile",
      icon: Users,
    },
    {
      label: "Appearance",
      description: "Customize your theme presets",
      href: "/settings/themes",
      icon: Palette,
    },
    {
      label: "Security",
      description: "Manage 2FA and account security",
      href: "/settings/security",
      icon: ShieldCheck,
    },
    {
      label: isSubscribed ? "Manage Subscription" : `Upgrade to ${siteConfig.proTier}`,
      description: isSubscribed
        ? "View invoices and billing details"
        : "Unlock all features and AI generation",
      href: "/settings/billing",
      icon: CreditCard,
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={session.user.image ?? ""} alt={name} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
              Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={isSubscribed ? "default" : "secondary"}>
            {isSubscribed ? (
              <>
                <Zap className="mr-1 h-3 w-3" />
                {siteConfig.proTier}
              </>
            ) : (
              "Free Plan"
            )}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Themes</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{themes}</p>
            <p className="text-xs text-muted-foreground mt-0.5">saved themes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Requests</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{aiRequests}</p>
            <p className="text-xs text-muted-foreground mt-0.5">last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isSubscribed ? siteConfig.proTier : "Free"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSubscribed ? "All features unlocked" : "5 AI requests / month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks and settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-md p-3 hover:bg-muted transition-colors group"
              >
                <div className="rounded-md bg-muted p-2 shrink-0 group-hover:bg-background transition-colors">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Your last account events.</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((event, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate capitalize">
                        {formatAction(event.action)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(new Date(event.createdAt))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA — only for free users */}
      {!isSubscribed && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-base">
                Unlock {siteConfig.proTier} — unlimited AI generation
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Get unlimited AI requests, priority support, and early access to new features.
              </p>
            </div>
            <Button asChild className="shrink-0 w-full sm:w-auto">
              <Link href="/settings/billing">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade now
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
