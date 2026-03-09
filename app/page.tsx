import { auth } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingCTA } from "@/components/landing/landing-cta";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CreditCard,
  Database,
  Mail,
  Users,
  Palette,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Every auth flow your users expect — email, OAuth, 2FA, magic links, and email OTP. Pre-built and battle-tested.",
    items: ["Google, GitHub, Discord OAuth", "TOTP + backup codes 2FA", "Magic link & email OTP", "Session management"],
  },
  {
    icon: CreditCard,
    title: "Billing & Subscriptions",
    description:
      "Polar-powered subscriptions with automated webhooks, customer portal, and usage metering — zero payment headaches.",
    items: ["Subscription management", "Customer self-serve portal", "Webhook handling", "Usage metering"],
  },
  {
    icon: Database,
    title: "Database & ORM",
    description:
      "Neon serverless PostgreSQL with Drizzle ORM — fully typed queries, migrations, and multi-tenant patterns out of the box.",
    items: ["Neon serverless Postgres", "Drizzle ORM + migrations", "Type-safe queries", "Multi-tenant ready"],
  },
  {
    icon: Mail,
    title: "Transactional Email",
    description:
      "Resend-powered email with prebuilt templates for auth flows, billing events, and custom notifications.",
    items: ["Welcome & verification emails", "Password reset flows", "Billing event notifications", "Custom templates"],
  },
  {
    icon: Users,
    title: "Admin Panel",
    description:
      "Full-featured admin dashboard with user management, audit logs, analytics, and role-based access — day one.",
    items: ["User management", "Audit log viewer", "Analytics dashboard", "Role-based access control"],
  },
  {
    icon: Palette,
    title: "25+ Theme Presets",
    description:
      "Beautiful, accessible themes your users can apply instantly. Light and dark mode with full CSS variable control.",
    items: ["25+ curated presets", "Light & dark mode", "CSS variable based", "Figma export"],
  },
  {
    icon: ShieldCheck,
    title: "Security",
    description:
      "Rate limiting, API key management, Zod validation, and RBAC middleware — security best practices baked in from the start.",
    items: ["Upstash rate limiting", "Hashed API key management", "RBAC middleware", "Zod input validation"],
  },
  {
    icon: Activity,
    title: "Observability",
    description:
      "PostHog product analytics, Sentry error tracking, and structured logging — always know what's happening in production.",
    items: ["PostHog analytics", "Sentry error tracking", "Structured logging", "Health check endpoints"],
  },
];

const stack = [
  { name: "Next.js 16", desc: "App Router" },
  { name: "Better Auth", desc: "Auth layer" },
  { name: "Drizzle ORM", desc: "Type-safe DB" },
  { name: "Neon", desc: "Serverless Postgres" },
  { name: "Polar", desc: "Billing" },
  { name: "Resend", desc: "Email delivery" },
  { name: "shadcn/ui", desc: "Components" },
  { name: "Tailwind v4", desc: "Styling" },
  { name: "PostHog", desc: "Analytics" },
  { name: "Sentry", desc: "Error tracking" },
];

const skipped = [
  "OAuth plumbing",
  "Webhook signatures",
  "Email templates",
  "DB migrations",
  "Admin dashboards",
  "Rate limiting",
  "2FA setup",
  "Audit logging",
];

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/settings/themes");

  return (
    <div className="bg-background min-h-screen">
      <LandingNav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 gap-1.5">
          <Zap className="size-3" />
          Production-ready. Deploy today.
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]">
          Ship your SaaS without
          <br className="hidden md:block" />
          <span className="text-primary"> the boring parts</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl mt-6 max-w-xl leading-relaxed">
          {siteConfig.name} handles auth, billing, email, database, and admin so you
          can focus on the features that make your product unique.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <LandingCTA />
        </div>

        <p className="text-muted-foreground text-xs mt-4">
          Free to use. No credit card required.
        </p>
      </section>

      {/* What you skip */}
      <section className="px-4 py-10 border-y bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-widest">
            Stop spending weeks on infrastructure
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs text-center">
            {skipped.map((item) => (
              <div
                key={item}
                className="flex flex-col items-center gap-1.5 text-muted-foreground"
              >
                <CheckCircle2 className="size-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything included
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Every feature a production SaaS needs — configured, integrated, and ready to ship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-card border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <f.icon className="size-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {f.description}
                </p>
                <ul className="space-y-1.5 pt-1">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="size-3 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 border-t bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            From zero to shipped in hours
          </h2>
          <p className="text-muted-foreground text-sm mb-12">
            No boilerplate decisions. No integration rabbit holes. Just your product.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            {[
              {
                step: "1",
                title: "Clone & configure",
                desc: "Set your env vars — database, auth providers, billing, email. Everything is documented and ready.",
              },
              {
                step: "2",
                title: "Build your feature",
                desc: "Auth, billing, email, and admin are already done. Open your IDE and start on what actually matters.",
              },
              {
                step: "3",
                title: "Deploy to production",
                desc: "CI/CD via GitHub Actions, Vercel-ready. Push to main and your users can sign up today.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{s.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="px-4 py-16 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Built on the best stack</h2>
          <p className="text-muted-foreground text-sm mb-10">
            Industry-standard tools. No vendor lock-in, no surprises.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stack.map((s) => (
              <div key={s.name} className="bg-card border rounded-lg px-3 py-3 text-center">
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 border-t text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Ready to launch faster?
        </h2>
        <p className="text-muted-foreground mt-3 mb-8 max-w-sm mx-auto">
          Clone, configure, and ship. Your first user could sign up today.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <LandingCTA variant="footer" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js, Better Auth, Polar, and Resend.
      </footer>
    </div>
  );
}
