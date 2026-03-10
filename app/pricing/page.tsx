import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyActiveSubscription } from "@/lib/subscription";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { UpgradeButton } from "@/app/settings/billing/upgrade-button";

export const metadata = {
  title: `Pricing — ${siteConfig.name}`,
  description: `Simple, transparent pricing. Start free, upgrade when you need more.`,
};

const FREE_FEATURES = [
  "Full access to all theme presets",
  "Light & dark mode support",
  "Export themes to CSS / Tailwind",
  "5 AI theme generations per month",
  "Community theme library",
  "Public API access",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited AI theme generation",
  "Team / organization support",
  "Priority email support",
  "Early access to new features",
  "Advanced analytics",
  "API rate limit increase",
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing settings anytime. You keep Pro access until the end of your billing period.",
  },
  {
    q: "What payment methods are accepted?",
    a: "All major credit and debit cards via Stripe. Invoices available on request.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee on your first payment. Contact support to request one.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan is available indefinitely — no credit card required. Upgrade only when you need more.",
  },
];

export default async function PricingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSubscribed = session?.user?.id
    ? !!(await getMyActiveSubscription(session.user.id))
    : false;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Simple pricing
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Start free.{" "}
            <span className="text-primary">Upgrade when you&apos;re ready.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            No hidden fees. No per-seat pricing. One flat rate for everything you need to build and ship faster.
          </p>
        </section>

        {/* Plans */}
        <section className="px-4 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>Everything you need to get started.</CardDescription>
                <div className="pt-2">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-1.5">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2.5 text-sm">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {session ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Get started free</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Pro */}
            <Card className="flex flex-col border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="shadow-sm">
                  <Zap className="mr-1 h-3 w-3" />
                  Most popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{siteConfig.proTier}</CardTitle>
                <CardDescription>For power users and growing teams.</CardDescription>
                <div className="pt-2">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground ml-1.5">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2.5 text-sm">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isSubscribed ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/settings/billing">Manage subscription</Link>
                  </Button>
                ) : (
                  <UpgradeButton label={`Upgrade to ${siteConfig.proTier}`} />
                )}
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 pb-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border rounded-lg p-5">
                <p className="font-medium text-sm mb-2">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Still have questions?{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-4">
              Contact us
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
