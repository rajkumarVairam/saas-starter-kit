# Observability — Background Jobs, Analytics, Error Tracking, Logging

## 8. Background Jobs (Inngest)

**Install:** `pnpm add inngest`
**Docs:** <https://www.inngest.com/docs>

### Environment variables

```
INNGEST_EVENT_KEY=""    # "local" for dev, real key for prod
INNGEST_SIGNING_KEY=""  # from Inngest dashboard
```

### inngest/client.ts

```typescript
import { Inngest } from "inngest"
export const inngest = new Inngest({ id: "saas-kit" })
```

### app/api/inngest/route.ts — serve handler

```typescript
import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { welcomeEmail } from "@/inngest/functions/welcome-email"

export const { GET, POST, PUT } = serve({ client: inngest, functions: [welcomeEmail] })
```

### Function pattern

```typescript
// inngest/functions/welcome-email.ts
export const welcomeEmail = inngest.createFunction(
    { id: "send-welcome-email", retries: 3 },
    { event: "user/created" },
    async ({ event, step }) => {
        await step.run("send-email", async () => {
            // step.run handles retries automatically
        })
    }
)

// Trigger from auth databaseHooks — fire-and-forget
inngest.send({ name: "user/created", data: { userId: user.id, email: user.email } })
    .catch(console.error)
```

---

## 9. Analytics (PostHog)

**Install:** `pnpm add posthog-js posthog-node`

### Environment variables

```
NEXT_PUBLIC_POSTHOG_KEY=""   # phc_...
NEXT_PUBLIC_POSTHOG_HOST=""  # https://app.posthog.com or self-hosted
```

### providers/posthog.tsx — client provider

```typescript
"use client"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PHProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            capture_pageview: false,  // handle manually with usePathname
        })
    }, [])
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

### Server-side capture

```typescript
import { PostHog } from "posthog-node"
const ph = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!)
ph.capture({ distinctId: userId, event: "subscription_started", properties: { plan: planId } })
await ph.shutdown()  // MUST flush before serverless function exits — do not skip
```

---

## 10. Error Tracking (Sentry)

**Install:** `pnpm add @sentry/nextjs`
**Setup:** `pnpm sentry-wizard -i nextjs` — auto-creates config files

### Environment variables

```
SENTRY_DSN=""           # https://xxx@oxx.ingest.sentry.io/xxx
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""    # for source map upload in CI
```

### next.config.ts — source maps only in CI

```typescript
import { withSentryConfig } from "@sentry/nextjs"
export default withSentryConfig(nextConfig, {
    silent: true,
    widenClientFileUpload: true,
    disableServerWebpackPlugin: !process.env.CI,  // don't upload locally
    disableClientWebpackPlugin:  !process.env.CI,
})
```

### Manual capture pattern

```typescript
import * as Sentry from "@sentry/nextjs"
try {
    // risky operation
} catch (err) {
    Sentry.captureException(err, { extra: { userId: session.user.id } })
    throw err  // re-throw so Next.js error boundary handles it
}
```

---

## 13. Structured Logging (Pino)

**Install:** `pnpm add pino pino-pretty`

### lib/logger.ts

```typescript
import pino from "pino"
export const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    ...(process.env.NODE_ENV === "development"
        ? { transport: { target: "pino-pretty" } }
        : {}),
})
```

### Usage rules

```typescript
// Always include userId and action
logger.info({ userId: session.user.id, action: "subscription_upgrade", planId }, "Subscription upgraded")
logger.error({ userId, err }, "Stripe webhook failed")
// Never log PII — no passwords, no raw emails, only userId
```
