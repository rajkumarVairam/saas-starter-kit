# Infrastructure — DB Production, Feature Flags, Health Checks, Admin Panel

## 12. Feature Flags (DB-backed)

No external service needed for a starter. Add to `lib/db/schema.ts`:

```typescript
export const featureFlag = pgTable("feature_flag", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull().unique(),
    enabled: boolean("enabled").notNull().default(false),
    targetPlanIds: text("target_plan_ids"),  // JSON: '["pro","enterprise"]' or null = all
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
})
```

### lib/flags.ts

```typescript
export async function isEnabled(key: string, userPlanId?: string): Promise<boolean> {
    const flag = await db.query.featureFlag.findFirst({ where: eq(featureFlag.key, key) })
    if (!flag?.enabled) return false
    if (!flag.targetPlanIds) return true
    const plans = JSON.parse(flag.targetPlanIds) as string[]
    return !userPlanId || plans.includes(userPlanId)
}

// Usage in server component or API route:
if (await isEnabled("ai-assistant", sub?.planId)) { /* show feature */ }
```

---

## 18. Database — Production Concerns

### Connection pooling (critical for Neon + serverless)

Neon HTTP mode avoids TCP connection limits in serverless environments.

```typescript
// lib/db/index.ts — use HTTP driver for serverless
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

For long-running Node servers (not Vercel), use `@neondatabase/serverless` with WebSocket pooling instead.

### Zero-downtime migrations — rules

1. **Never drop a column in the same deploy that removes its usage.** First deploy removes usage, second deploy drops column.
2. **Never rename a column directly.** Add new column → backfill → update reads/writes → drop old column (3 deploys).
3. **Always add columns as nullable or with defaults** — old code can't set them.
4. **Use `db:generate` + `db:migrate` in production** — never `db:push` (it can drop data).

```bash
# Production migration workflow:
pnpm run db:generate   # create migration file
git add drizzle/       # commit migration with code
# Deploy — migration runs automatically on startup via:
pnpm run db:migrate
```

### Row-level security — org data isolation

Every query on multi-tenant tables MUST filter by `organizationId`. Never rely on application logic alone.

```typescript
// WRONG — leaks data across orgs if session check is bypassed
db.query.file.findMany()

// CORRECT — always scope to org
db.query.file.findMany({
    where: and(
        eq(file.organizationId, session.session.activeOrganizationId!),
        eq(file.userId, session.user.id)
    )
})
```

Consider enabling Postgres RLS policies on sensitive tables for defense-in-depth:

```sql
ALTER TABLE file ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation ON file
    USING (organization_id = current_setting('app.current_org_id'));
```

---

## 19. Health Check Endpoints

Required for load balancers, uptime monitors (Better Uptime, UptimeRobot), and Kubernetes probes.

### app/api/health/route.ts — liveness (is the process alive?)

```typescript
export async function GET() {
    return Response.json({ status: "ok", timestamp: new Date().toISOString() })
}
```

### app/api/ready/route.ts — readiness (can the app serve traffic?)

```typescript
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export async function GET() {
    try {
        await db.execute(sql`SELECT 1`)
        return Response.json({ status: "ready", db: "ok" })
    } catch (err) {
        return Response.json({ status: "not ready", db: "error" }, { status: 503 })
    }
}
```

Add both to `proxy.ts` matcher exclusions so they bypass auth.

---

## 20. Admin Panel

No framework needed — use existing dashboard layout + RBAC. Create a `/admin` route group gated to a `superAdmin` flag on the user table.

### Drizzle schema — add superAdmin to user

```typescript
// Add to user table in lib/db/schema.ts
isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
```

### app/admin/layout.tsx — server guard

```typescript
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { user } from "@/lib/db/schema"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/sign-in")

    const u = await db.query.user.findFirst({ where: eq(user.id, session.user.id) })
    if (!u?.isSuperAdmin) redirect("/dashboard")

    return <>{children}</>
}
```

### Admin pages to build

```
app/admin/
  layout.tsx          — super admin guard
  page.tsx            — overview: user count, MRR, active subs
  users/page.tsx      — searchable user table, impersonate, ban
  organizations/page.tsx — org list, member count, plan
  subscriptions/page.tsx — Stripe subscription status, manual overrides
  audit-log/page.tsx  — searchable audit log table with filters
  flags/page.tsx      — feature flag toggle UI
```
