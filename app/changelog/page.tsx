import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Changelog — ${siteConfig.name}`,
  description: `What's new in ${siteConfig.name}`,
};

interface Release {
  version: string;
  date: string;
  tag: "major" | "minor" | "patch" | "fix";
  changes: {
    type: "added" | "changed" | "fixed" | "removed";
    text: string;
  }[];
}

const releases: Release[] = [
  {
    version: "1.2.0",
    date: "2026-03-08",
    tag: "minor",
    changes: [
      { type: "added", text: "Admin analytics dashboard with 30-day user and theme growth charts" },
      { type: "added", text: "Theme forking — copy any community theme to your account with one click" },
      { type: "added", text: "Billing settings page with subscription status and plan comparison" },
      { type: "added", text: "Notification preferences page" },
      { type: "added", text: "Admin panel: user management, community moderation, audit log viewer" },
      { type: "added", text: "API documentation page at /docs" },
      { type: "fixed", text: "Public theme pages now return 404 for unpublished themes" },
      { type: "fixed", text: "Email idempotency via Resend X-Idempotency-Key to prevent duplicate sends" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-02-15",
    tag: "minor",
    changes: [
      { type: "added", text: "Multi-provider AI support: switch between Gemini, OpenAI, Anthropic, and Groq via AI_PROVIDER env var" },
      { type: "added", text: "Sentry error monitoring wired via Next.js instrumentation.ts" },
      { type: "added", text: "Skeleton loading states for settings/themes and settings/account" },
      { type: "added", text: "OAuth 2.0 server with PKCE for third-party integrations" },
      { type: "changed", text: "All brand strings centralized in config/site.ts" },
      { type: "fixed", text: "Webhook idempotency — Polar events no longer create duplicate subscription rows" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-01-01",
    tag: "major",
    changes: [
      { type: "added", text: "Authentication via Better Auth — GitHub and Google OAuth" },
      { type: "added", text: "Subscription billing via Polar.sh with full webhook handler" },
      { type: "added", text: "Visual theme editor with 150+ presets and real-time preview" },
      { type: "added", text: "AI theme generation from text and images (Pro)" },
      { type: "added", text: "Community gallery: publish, browse, and like themes" },
      { type: "added", text: "Rate limiting via Upstash, audit logging, transactional email via Resend" },
      { type: "added", text: "Settings: saved themes, AI usage, sessions, account deletion" },
      { type: "added", text: "Pricing page, legal pages (privacy policy + terms of service)" },
    ],
  },
];

const tagColors: Record<Release["tag"], string> = {
  major: "default",
  minor: "secondary",
  patch: "outline",
  fix: "outline",
};

const typeLabels: Record<string, { label: string; color: string }> = {
  added: { label: "Added", color: "text-green-600 dark:text-green-400" },
  changed: { label: "Changed", color: "text-blue-600 dark:text-blue-400" },
  fixed: { label: "Fixed", color: "text-amber-600 dark:text-amber-400" },
  removed: { label: "Removed", color: "text-destructive" },
};

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="mt-2 text-muted-foreground">
            A record of all notable changes to {siteConfig.name}.
          </p>
        </div>

        <div className="space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-border">
              {/* Dot */}
              <div className="absolute left-[-4px] top-2 size-2 rounded-full bg-primary" />

              <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold">v{release.version}</h2>
                  <Badge variant={tagColors[release.tag] as "default" | "secondary" | "outline"}>
                    {release.tag}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                </div>

                {/* Changes grouped by type */}
                {(["added", "changed", "fixed", "removed"] as const).map((type) => {
                  const items = release.changes.filter((c) => c.type === type);
                  if (items.length === 0) return null;
                  const { label, color } = typeLabels[type];
                  return (
                    <div key={type}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>
                        {label}
                      </p>
                      <ul className="space-y-1">
                        {items.map((c, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 size-1.5 rounded-full bg-border shrink-0" />
                            {c.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
