# Enterprise Features — Audit Log, GDPR, Onboarding, Notifications, i18n, Support, Changelog

## 14. Changelog & Versioning

**Install:** `pnpm add -D @changesets/cli`

```bash
pnpm changeset init     # one-time setup
pnpm changeset          # describe what changed + bump type
pnpm changeset version  # writes CHANGELOG.md + bumps package.json
```

### CI release tag (add to .github/workflows/release.yml)

```yaml
- run: pnpm changeset version
- run: git commit -am "chore: release"
- run: git tag v$(node -p "require('./package.json').version")
- run: git push --follow-tags
```

---

## 21. Audit Log UI

The `audit_log` table already exists. Build a queryable UI page.

### app/admin/audit-log/page.tsx — server component with filters

```typescript
export default async function AuditLogPage({ searchParams }: { searchParams: { userId?: string; action?: string; page?: string } }) {
    const page  = Number(searchParams.page ?? 1)
    const limit = 50
    const offset = (page - 1) * limit

    const logs = await db.query.auditLog.findMany({
        where: and(
            searchParams.userId ? eq(auditLog.userId, searchParams.userId) : undefined,
            searchParams.action ? eq(auditLog.action, searchParams.action) : undefined,
        ),
        orderBy: desc(auditLog.createdAt),
        limit,
        offset,
        with: { user: { columns: { name: true, email: true } } },
    })
    // render table
}
```

### Useful audit actions to log (add to databaseHooks)

```
USER_CREATED, USER_DELETED, USER_UPDATED
SESSION_CREATED, SESSION_REVOKED
PASSWORD_CHANGED, EMAIL_CHANGED
ORG_CREATED, ORG_MEMBER_ADDED, ORG_MEMBER_REMOVED
SUBSCRIPTION_UPGRADED, SUBSCRIPTION_CANCELED
API_KEY_CREATED, API_KEY_REVOKED
ADMIN_IMPERSONATION
```

---

## 26. GDPR — Data Export & Deletion

Legal requirement for EU users. Must implement before any EU go-live.

### app/api/account/export/route.ts — data export

```typescript
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const userId = session.user.id

    const [userData, sessions, files, memberships, auditLogs] = await Promise.all([
        db.query.user.findFirst({ where: eq(user.id, userId) }),
        db.query.session.findMany({ where: eq(session.userId, userId) }),
        db.query.file.findMany({ where: eq(file.userId, userId) }),
        db.query.member.findMany({ where: eq(member.userId, userId) }),
        db.query.auditLog.findMany({ where: eq(auditLog.userId, userId) }),
    ])

    const export_ = {
        exportedAt: new Date().toISOString(),
        user: userData,
        sessions, files, memberships, auditLogs,
    }

    return new Response(JSON.stringify(export_, null, 2), {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="data-export-${userId}.json"`,
        },
    })
}
```

### app/api/account/delete/route.ts — right to erasure

```typescript
export async function DELETE(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const userId = session.user.id

    // 1. Cancel Stripe subscription
    const sub = await getSubscription(userId)
    if (sub?.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId).catch(console.error)
    }

    // 2. Delete all files from R2
    // (query file table, delete from R2, then delete DB rows)

    // 3. Anonymize audit logs (keep logs, remove PII)
    await db.update(auditLog).set({ userId: null }).where(eq(auditLog.userId, userId))

    // 4. Hard delete user — cascades to sessions, accounts, members, subscription
    await authClient.deleteUser({ callbackURL: "/" })  // Better Auth handles cascade

    return new Response(null, { status: 204 })
}
```

### Cookie consent

Add a cookie consent banner before loading analytics/tracking:

```typescript
// components/cookie-banner.tsx — show on first visit, store consent in localStorage
const consent = localStorage.getItem("cookie-consent")
if (consent === "accepted") { posthog.init(...) }
```

---

## 27. Onboarding Flow

Prevent empty-state churn. Add an onboarding state machine.

### Drizzle schema — onboarding progress

```typescript
// Add to user table:
onboardingStep: text("onboarding_step").default("welcome"),
// Steps: "welcome" → "create-org" → "invite-team" → "complete"
```

### app/onboarding/layout.tsx

```typescript
// Guard: redirect to /dashboard if onboarding is complete
const u = await db.query.user.findFirst({ where: eq(user.id, session.user.id) })
if (u?.onboardingStep === "complete") redirect("/dashboard")
```

### Onboarding pages

```
app/onboarding/
  page.tsx           — welcome + app name, "Get started" CTA
  create-org/page.tsx — org name + slug form
  invite-team/page.tsx — email invite inputs (skip allowed)
  complete/page.tsx  — success confetti, link to dashboard
```

After each step: `await db.update(user).set({ onboardingStep: "next-step" })`

---

## 28. In-App Notifications

Bell icon + notification feed. No external service needed for basic implementation.

### Drizzle schema

```typescript
export const notification = pgTable("notification", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),    // "invite" | "billing" | "security" | "info"
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),              // optional deep-link
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("notification_userId_idx").on(t.userId)])
```

### app/api/notifications/route.ts

```typescript
// GET — fetch unread count + recent notifications
export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const notifications = await db.query.notification.findMany({
        where: eq(notification.userId, session.user.id),
        orderBy: desc(notification.createdAt),
        limit: 20,
    })
    const unreadCount = notifications.filter(n => !n.read).length
    return Response.json({ notifications, unreadCount })
}

// PATCH — mark all as read
export async function PATCH(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })
    await db.update(notification)
        .set({ read: true })
        .where(eq(notification.userId, session.user.id))
    return new Response(null, { status: 204 })
}
```

### Sending notifications

```typescript
// lib/notify.ts
export async function notify(userId: string, data: {
    type: string; title: string; body?: string; href?: string
}) {
    db.insert(notification).values({ userId, ...data }).catch(console.error)
}

// Usage:
await notify(userId, { type: "billing", title: "Payment failed", href: "/dashboard/billing" })
```

---

## 30. OpenAPI / API Documentation

**Install:** `pnpm add zod-to-openapi @asteasolutions/zod-to-openapi`

### Pattern — generate OpenAPI spec from Zod schemas

```typescript
// lib/openapi.ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

export const registry = new OpenAPIRegistry()

registry.registerPath({
    method: "post",
    path: "/api/billing/checkout",
    summary: "Create Stripe checkout session",
    request: {
        body: { content: { "application/json": {
            schema: z.object({ priceId: z.string() })
        }}}
    },
    responses: {
        200: { description: "Checkout URL", content: { "application/json": {
            schema: z.object({ url: z.string().url() })
        }}},
        401: { description: "Unauthorized" },
    },
})

// app/api/docs/route.ts — serve the spec
export async function GET() {
    const generator = new OpenApiGeneratorV3(registry.definitions)
    const spec = generator.generateDocument({
        openapi: "3.0.0",
        info: { title: "SaaS Kit API", version: "1.0.0" },
        servers: [{ url: process.env.BETTER_AUTH_URL! }],
    })
    return Response.json(spec)
}
```

Render with Swagger UI: `pnpm add swagger-ui-react` → `app/docs/page.tsx`

---

## 31. Customer Support (Crisp / Intercom)

**Recommended:** Crisp — generous free tier, GDPR-compliant, no per-seat pricing

### providers/crisp.tsx

```typescript
"use client"
import { useEffect } from "react"
import { useSession } from "@/lib/auth-client"

export function CrispProvider() {
    const { data: session } = useSession()

    useEffect(() => {
        if (typeof window === "undefined") return
        window.$crisp = []
        window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_ID!
        const s = document.createElement("script")
        s.src = "https://client.crisp.chat/l.js"
        s.async = true
        document.head.appendChild(s)
    }, [])

    useEffect(() => {
        if (!session?.user || !window.$crisp) return
        window.$crisp.push(["set", "user:email", [session.user.email]])
        window.$crisp.push(["set", "user:nickname", [session.user.name]])
    }, [session])

    return null
}
```

### Environment variable

```
NEXT_PUBLIC_CRISP_ID=""   # from Crisp dashboard
```

---

## 32. Internationalization (i18n)

**Install:** `pnpm add next-intl`
**Docs:** <https://next-intl-docs.vercel.app>

### File structure

```
messages/
  en.json
  fr.json
  de.json
i18n/
  request.ts      — locale detection
  routing.ts      — locale routing config
```

### next-intl routing config (i18n/routing.ts)

```typescript
import { defineRouting } from "next-intl/routing"
export const routing = defineRouting({
    locales: ["en", "fr", "de"],
    defaultLocale: "en",
})
```

### Usage in server components

```typescript
import { getTranslations } from "next-intl/server"
const t = await getTranslations("Auth")
// <h1>{t("signIn")}</h1>
```

### Usage in client components

```typescript
import { useTranslations } from "next-intl"
const t = useTranslations("Auth")
// <Button>{t("submit")}</Button>
```
