# Billing — Stripe, Metering, Dunning

## 5. Stripe Billing

**Install:** `pnpm add stripe`
**Docs:** <https://stripe.com/docs/api> | <https://stripe.com/docs/webhooks>

### Environment variables

```
STRIPE_SECRET_KEY=""                   # sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=""               # whsec_... — differs between local and prod
STRIPE_PRO_PRICE_ID=""                 # price_... from Stripe dashboard
STRIPE_ENTERPRISE_PRICE_ID=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""  # pk_live_... or pk_test_...
```

### lib/stripe.ts — singleton + plan config

```typescript
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
})

export type PlanId = "free" | "pro" | "enterprise"

export const PLANS: Record<PlanId, {
    name: string; price: number; priceId: string | null;
    limits: { members: number; orgs: number; storageMb: number }
}> = {
    free:       { name: "Free",       price: 0,  priceId: null,
                  limits: { members: 1,  orgs: 1,  storageMb: 500 } },
    pro:        { name: "Pro",        price: 29, priceId: process.env.STRIPE_PRO_PRICE_ID!,
                  limits: { members: 10, orgs: 3,  storageMb: 10000 } },
    enterprise: { name: "Enterprise", price: 99, priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
                  limits: { members: -1, orgs: -1, storageMb: -1 } },  // -1 = unlimited
}
```

### Drizzle schema — subscription table

```typescript
export const subscription = pgTable("subscription", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    // status: "free" | "active" | "trialing" | "past_due" | "canceled" | "incomplete"
    status: text("status").notNull().default("free"),
    planId: text("plan_id").notNull().default("free"),
    priceId: text("price_id"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
})
// After adding: pnpm run db:push (dev) or db:generate + db:migrate (prod)
```

### lib/billing.ts — server helpers

```typescript
// Lazy customer creation — NEVER create on sign-up hook, only when user touches billing
export async function getOrCreateStripeCustomer(userId: string, email: string, name: string) {
    const sub = await db.query.subscription.findFirst({ where: eq(subscription.userId, userId) })
    if (sub?.stripeCustomerId) return sub.stripeCustomerId

    const customer = await stripe.customers.create({ email, name, metadata: { userId } })
    await db.insert(subscription).values({ userId, stripeCustomerId: customer.id })
        .onConflictDoUpdate({ target: subscription.userId, set: { stripeCustomerId: customer.id } })
    return customer.id
}

export async function getSubscription(userId: string) {
    return db.query.subscription.findFirst({ where: eq(subscription.userId, userId) })
}

export async function requirePlan(userId: string, minPlan: PlanId) {
    const order: PlanId[] = ["free", "pro", "enterprise"]
    const sub = await getSubscription(userId)
    const userPlan = (sub?.planId ?? "free") as PlanId
    if (order.indexOf(userPlan) < order.indexOf(minPlan))
        throw new Error(`Plan ${minPlan} required. Current: ${userPlan}`)
}
```

### app/api/billing/checkout/route.ts

```typescript
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const { priceId } = await req.json()
    const customerId = await getOrCreateStripeCustomer(
        session.user.id, session.user.email, session.user.name ?? ""
    )
    const checkout = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing?success=1`,
        cancel_url:  `${process.env.BETTER_AUTH_URL}/dashboard/billing?canceled=1`,
        metadata: { userId: session.user.id },
    })
    return Response.json({ url: checkout.url })
}
```

### app/api/billing/portal/route.ts

```typescript
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const sub = await getSubscription(session.user.id)
    if (!sub?.stripeCustomerId) return new Response("No billing account", { status: 400 })

    const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing`,
    })
    return Response.json({ url: portal.url })
}
```

### app/api/webhooks/stripe/route.ts — critical patterns

```typescript
export async function POST(req: Request) {
    const body = await req.text()   // MUST be raw text — never req.json()
    const sig  = req.headers.get("stripe-signature")!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch {
        return new Response("Webhook signature invalid", { status: 400 })
    }

    // Always upsert — events can arrive more than once
    if (event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated") {
        const s = event.data.object as Stripe.Subscription
        await db.update(subscription).set({
            stripeSubscriptionId: s.id,
            status: s.status,
            planId: resolvePlanFromPriceId(s.items.data[0].price.id),
            priceId: s.items.data[0].price.id,
            currentPeriodEnd: new Date(s.current_period_end * 1000),  // Unix → JS Date
            cancelAtPeriodEnd: s.cancel_at_period_end,
        }).where(eq(subscription.stripeCustomerId, s.customer as string))
    }

    if (event.type === "customer.subscription.deleted") {
        const s = event.data.object as Stripe.Subscription
        await db.update(subscription)
            .set({ status: "canceled", planId: "free", stripeSubscriptionId: null })
            .where(eq(subscription.stripeCustomerId, s.customer as string))
    }

    if (event.type === "invoice.payment_failed") {
        const inv = event.data.object as Stripe.Invoice
        await db.update(subscription).set({ status: "past_due" })
            .where(eq(subscription.stripeCustomerId, inv.customer as string))
    }

    return new Response(null, { status: 200 })  // always 200 or Stripe retries
}
```

### Webhook gotchas

1. **Raw body** — `req.text()` not `req.json()`. Parsing destroys the signature.
2. **Always 200** — even for unhandled events, or Stripe will retry indefinitely.
3. **Upsert not insert** — `onConflictDoUpdate` so duplicate deliveries don't fail.
4. **Unix × 1000** — `current_period_end` is Unix seconds, multiply for JS `Date`.
5. **Two webhook secrets** — `stripe listen` gives a local secret; dashboard gives a prod secret. Store separately.
6. **Local testing** — `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Plan gating

```typescript
// Server component
const sub = await getSubscription(session.user.id)
if (!sub || sub.planId === "free") redirect("/dashboard/billing")

// API route
await requirePlan(session.user.id, "pro")  // throws if below pro
```

---

## 25. Usage Metering & Limit Enforcement

Plan limits exist in the PLANS config but must be actively checked before writes.

### lib/limits.ts — check before creating resources

```typescript
import { PLANS, type PlanId } from "@/lib/stripe"

export async function assertCanAddMember(orgId: string, planId: PlanId) {
    const plan  = PLANS[planId]
    if (plan.limits.members === -1) return  // unlimited

    const count = await db.$count(member, eq(member.organizationId, orgId))
    if (count >= plan.limits.members)
        throw new Error(`Member limit reached. Upgrade to add more members.`)
}

export async function assertCanUploadFile(userId: string, planId: PlanId, fileSizeBytes: number) {
    const plan = PLANS[planId]
    if (plan.limits.storageMb === -1) return

    const usage = await db
        .select({ total: sql<number>`sum(${file.size})` })
        .from(file)
        .where(eq(file.userId, userId))

    const usedMb  = (usage[0]?.total ?? 0) / (1024 * 1024)
    const addedMb = fileSizeBytes / (1024 * 1024)
    if (usedMb + addedMb > plan.limits.storageMb)
        throw new Error(`Storage limit reached. Upgrade your plan.`)
}
```

### Usage dashboard widget

```typescript
const sub     = await getSubscription(userId)
const plan    = PLANS[(sub?.planId ?? "free") as PlanId]
const members = await db.$count(member, eq(member.organizationId, orgId))

// Render progress bar: members / plan.limits.members
```

---

## 33. Dunning Management

Auto-retry failed payments and email users before canceling.

### Stripe configuration (in dashboard, not code)

1. Stripe Dashboard → Settings → Billing → Subscriptions → Manage failed payments
2. Enable **Smart Retries** — Stripe picks optimal retry times using ML
3. Set retry schedule: Day 0, 3, 5, 7 → cancel
4. Enable **Dunning emails** from Stripe — they send payment failure emails automatically

### Your webhook handles the rest

```typescript
// Already in webhook handler:
if (event.type === "invoice.payment_failed") {
    // Update status to past_due
    // Optionally send your own email with Resend + link to billing portal
    await notify(userId, {
        type: "billing",
        title: "Payment failed — update your card",
        href: "/dashboard/billing",
    })
}

if (event.type === "customer.subscription.deleted") {
    // status → "canceled", planId → "free"
    // Send "Sorry to see you go" email
}
```

---

## 34. Metered / Usage-Based Billing

For AI tokens, API calls, storage overages — charge per use instead of flat rate.

### Stripe metered billing setup

1. Create a Price in Stripe with `billing_scheme: "per_unit"` + `usage_type: "metered"`
2. Report usage via API — do NOT estimate upfront

### Reporting usage

```typescript
// After an AI generation, API call, etc.
export async function recordUsage(userId: string, quantity: number) {
    const sub = await getSubscription(userId)
    if (!sub?.stripeSubscriptionId) return

    const subscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
    const itemId = subscription.items.data[0].id  // the metered price item

    await stripe.subscriptionItems.createUsageRecord(itemId, {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: "increment",  // not "set" — increment is idempotent-safe
    })
}

// Usage in product code — fire-and-forget
await recordUsage(session.user.id, tokensUsed).catch(console.error)
```
