# Security — Headers, Validation, Redis, SSO, API Keys, Webhooks, Secrets

## 15. Security Headers

**No install needed** — configure in `next.config.ts`.

### next.config.ts — security headers

```typescript
const securityHeaders = [
    { key: "X-DNS-Prefetch-Control",   value: "on" },
    { key: "X-Frame-Options",          value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options",   value: "nosniff" },
    { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "Content-Security-Policy",
        // Adjust script-src / connect-src as you add third-party scripts
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // tighten after dev
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https:",
            "font-src 'self'",
            "connect-src 'self' https://api.resend.com https://*.sentry.io https://api.stripe.com",
            "frame-src 'self' https://js.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join("; "),
    },
]

const nextConfig = {
    async headers() {
        return [{ source: "/(.*)", headers: securityHeaders }]
    },
}
```

### Verify headers

```bash
curl -I https://yourdomain.com | grep -i "x-frame\|x-content\|strict-transport\|content-security"
# Or use: https://securityheaders.com
```

---

## 16. Input Validation (Zod)

**Install:** `pnpm add zod`

Every API route MUST validate input at the boundary. Never trust `req.json()` directly.

### Pattern — validate before processing

```typescript
import { z } from "zod"

const UpdateProfileSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    bio:  z.string().max(500).optional(),
})

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) return new Response("Unauthorized", { status: 401 })

    const body = await req.json()
    const result = UpdateProfileSchema.safeParse(body)
    if (!result.success) {
        return Response.json({ error: result.error.flatten() }, { status: 422 })
    }

    const { name, bio } = result.data  // fully typed + sanitized
    // proceed with safe data
}
```

### Common schemas for this kit

```typescript
// lib/schemas.ts
import { z } from "zod"

export const EmailSchema    = z.string().email().max(254).toLowerCase().trim()
export const PasswordSchema = z.string().min(12).max(128)
export const UuidSchema     = z.string().uuid()
export const SlugSchema     = z.string().min(1).max(60).regex(/^[a-z0-9-]+$/)
export const PlanIdSchema   = z.enum(["free", "pro", "enterprise"])

export const PaginationSchema = z.object({
    page:  z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})
```

### Rules

- Use `.safeParse()` not `.parse()` in API routes — never throw unhandled Zod errors
- Sanitize with `.trim()` on all string inputs
- Coerce query params with `z.coerce.number()` — URL params are always strings
- Never validate on client only — always re-validate on server

---

## 17. Caching (Redis / Upstash)

**Recommended:** Upstash Redis — serverless-compatible, per-request pricing, free tier
**Install:** `pnpm add @upstash/redis @upstash/ratelimit`

### Environment variables

```
UPSTASH_REDIS_REST_URL=""   # https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=""
```

### lib/redis.ts — singleton client

```typescript
import { Redis } from "@upstash/redis"
export const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

### Distributed rate limiting (for custom API routes)

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),  // 10 req / 10s per IP
    analytics: true,
})

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success, limit, remaining } = await ratelimit.limit(ip)
    if (!success) return new Response("Too many requests", {
        status: 429,
        headers: { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining) }
    })
    // proceed
}
```

### Cache-aside pattern for expensive queries

```typescript
const CACHE_TTL = 60  // seconds

export async function getOrgMembers(orgId: string) {
    const cacheKey = `org:${orgId}:members`
    const cached = await redis.get<Member[]>(cacheKey)
    if (cached) return cached

    const members = await db.query.member.findMany({ where: eq(member.organizationId, orgId) })
    await redis.set(cacheKey, members, { ex: CACHE_TTL })
    return members
}

// Invalidate on write
await redis.del(`org:${orgId}:members`)
```

### Idempotency keys (for Stripe / critical mutations)

```typescript
const key = `idempotency:${userId}:create-subscription`
const existing = await redis.get(key)
if (existing) return Response.json(existing)  // return cached result

const result = await stripe.subscriptions.create(...)
await redis.set(key, result, { ex: 86400 })  // 24h
return Response.json(result)
```

---

## 22. SSO / SAML (Enterprise Auth)

**Better Auth has a SAML plugin.** Required for enterprise accounts using Okta, Azure AD, Google Workspace.

**Docs:** <https://better-auth.com/docs/plugins/saml>
**Install:** `pnpm add better-auth` (plugin is built-in, check docs for version)

### Environment variables

```
SAML_CERT=""        # your SP signing certificate (PEM)
SAML_KEY=""         # your SP private key (PEM)
```

### Server config (lib/auth.ts)

```typescript
import { saml } from "better-auth/plugins"

plugins: [
    saml({
        // IdP metadata URL or XML — provided by the enterprise customer
        // Configure per-org: store IdP metadata in organization.metadata field
    }),
]
```

### Org-level SSO flow

1. Admin uploads IdP metadata (Okta XML / Azure federation metadata URL) in org settings
2. Store in `organization.metadata` as JSON
3. SSO enforced for org members — password login disabled for that org
4. Just-in-time provisioning: new users auto-created on first SSO login

---

## 23. Customer API Keys

B2B customers need programmatic access to your API. Build a key management system.

### Drizzle schema

```typescript
export const apiKey = pgTable("api_key", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Store hash only — never store the raw key
    keyHash: text("key_hash").notNull().unique(),
    keyPrefix: text("key_prefix").notNull(),  // e.g. "sk_live_xxxx" for display
    scopes: text("scopes"),                   // JSON: ["read:users","write:data"]
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

### lib/api-keys.ts — generate + verify

```typescript
import { createHash, randomBytes } from "crypto"

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
    const raw    = `sk_live_${randomBytes(32).toString("hex")}`
    const hash   = createHash("sha256").update(raw).digest("hex")
    const prefix = raw.slice(0, 16) + "..."
    return { raw, hash, prefix }
}

export function hashApiKey(raw: string): string {
    return createHash("sha256").update(raw).digest("hex")
}

// In API middleware — look up by hash, never by raw key
export async function getSessionFromApiKey(req: Request) {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer sk_")) return null

    const raw  = authHeader.replace("Bearer ", "")
    const hash = hashApiKey(raw)

    const key = await db.query.apiKey.findFirst({
        where: and(eq(apiKey.keyHash, hash), or(isNull(apiKey.expiresAt), gt(apiKey.expiresAt, new Date())))
    })
    if (!key) return null

    // Update lastUsedAt fire-and-forget
    db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, key.id)).catch(console.error)

    return key
}
```

**Show the raw key ONCE on creation only.** Store and display only the prefix (`sk_live_xxxx...`) thereafter.

---

## 24. Outgoing Webhooks

Let customers subscribe to events from your app (Stripe-style).

### Drizzle schema

```typescript
export const webhookEndpoint = pgTable("webhook_endpoint", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    secret: text("secret").notNull(),  // HMAC signing secret — shown once on creation
    events: text("events").notNull(),  // JSON array: ["user.created","subscription.updated"]
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const webhookDelivery = pgTable("webhook_delivery", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    endpointId: text("endpoint_id").notNull().references(() => webhookEndpoint.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: text("payload").notNull(),  // JSON
    status: text("status").notNull().default("pending"),  // pending | success | failed
    responseStatus: integer("response_status"),
    attempts: integer("attempts").default(0).notNull(),
    nextRetryAt: timestamp("next_retry_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

### lib/webhooks.ts — dispatch with HMAC signature

```typescript
import { createHmac } from "crypto"

export async function dispatchWebhook(orgId: string, event: string, payload: object) {
    const endpoints = await db.query.webhookEndpoint.findMany({
        where: and(
            eq(webhookEndpoint.organizationId, orgId),
            eq(webhookEndpoint.enabled, true),
        )
    })

    for (const ep of endpoints) {
        const body      = JSON.stringify({ event, data: payload, timestamp: Date.now() })
        const signature = createHmac("sha256", ep.secret).update(body).digest("hex")

        fetch(ep.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Webhook-Signature": `sha256=${signature}`,
                "X-Webhook-Event": event,
            },
            body,
        }).catch(console.error)  // fire-and-forget — use Inngest for retries
    }
}

// Usage: after subscription changes, user events, etc.
await dispatchWebhook(orgId, "subscription.updated", { planId, status })
```

---

## 35. Dependency Security

### Automated scanning

Add to `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      dev-dependencies:
        dependency-type: "development"
```

### CI audit check (add to ci.yml)

```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
```

### Manual checks

```bash
pnpm audit             # check for known vulnerabilities
pnpm outdated          # check for stale packages
pnpm dlx npm-check-updates --interactive  # interactive upgrade
```

---

## 36. Secret Rotation

Rotate secrets without downtime using overlapping validity windows.

### Rotating BETTER_AUTH_SECRET

Better Auth uses the secret to sign session cookies. Rotation invalidates all sessions.

1. Add `BETTER_AUTH_SECRET_OLD` to env with the old secret value
2. Update Better Auth config to accept both (check docs for secondary secrets support)
3. Deploy — existing sessions still valid
4. After 7 days (session TTL), remove `BETTER_AUTH_SECRET_OLD`

### Rotating database credentials (Neon)

1. Create a new Neon role/password
2. Add new `DATABASE_URL` to env (keep old one)
3. Deploy and verify connectivity
4. Remove old `DATABASE_URL` + revoke old role in Neon

### Rotating Stripe keys

1. Stripe Dashboard → API Keys → Roll key
2. Stripe shows old + new key simultaneously for 24h
3. Update env, deploy, then confirm rollover in Stripe

### Rule: never rotate by deleting first

Always have the new secret in place and verified **before** removing the old one.
