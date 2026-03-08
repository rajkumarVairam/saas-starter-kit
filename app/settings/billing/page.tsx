import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyActiveSubscription } from "@/lib/subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { CreditCard, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/");

  const sub = await getMyActiveSubscription(session.user.id);
  const isSubscribed = !!sub && sub.productId === process.env.SAASKIT_PRO_PRODUCT_ID;

  const formatDate = (date: Date | null | undefined) =>
    date ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing details.</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription and usage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-lg">
                {isSubscribed ? siteConfig.proTier : "Free"}
              </p>
              {isSubscribed && sub ? (
                <p className="text-sm text-muted-foreground">
                  {sub.cancelAtPeriodEnd
                    ? `Cancels on ${formatDate(sub.currentPeriodEnd)}`
                    : `Renews on ${formatDate(sub.currentPeriodEnd)}`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Limited AI usage · up to 3 saved themes
                </p>
              )}
            </div>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? "Active" : "Free"}
            </Badge>
          </div>

          {isSubscribed && sub && (
            <>
              <Separator />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-medium mt-0.5">
                    {(sub.amount / 100).toLocaleString("en-US", { style: "currency", currency: sub.currency.toUpperCase() })}
                    {" / "}
                    {sub.recurringInterval}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium mt-0.5 flex items-center gap-1.5">
                    {sub.status === "active" ? (
                      <><CheckCircle2 className="size-3.5 text-green-500" /> Active</>
                    ) : (
                      <><XCircle className="size-3.5 text-destructive" /> {sub.status}</>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Current period</dt>
                  <dd className="font-medium mt-0.5">
                    {formatDate(sub.currentPeriodStart)} — {formatDate(sub.currentPeriodEnd)}
                  </dd>
                </div>
                {sub.cancelAtPeriodEnd && (
                  <div>
                    <dt className="text-muted-foreground">Cancellation</dt>
                    <dd className="font-medium mt-0.5 text-amber-600">
                      Ends {formatDate(sub.currentPeriodEnd)}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {isSubscribed ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/portal">
                  Manage Subscription
                  <ExternalLink className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/pricing">Upgrade to {siteConfig.proTier}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold mb-3">Free</p>
              <ul className="space-y-2 text-muted-foreground">
                {["Up to 3 saved themes", "All theme presets", "Export to Tailwind CSS", "Community gallery access"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">{siteConfig.proTier}</p>
              <ul className="space-y-2 text-muted-foreground">
                {["Unlimited saved themes", "AI theme generation", "Image-to-theme AI", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
