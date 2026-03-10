# Setup Guide

Everything you need to run LaunchKit as a fresh application — database, authentication, billing, AI, and deployment.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (`npm install -g pnpm`)
- **Git**

---

## 1. Clone and Install

```bash
git clone <your-repo-url> my-app
cd my-app
pnpm install
```

---

## 2. Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values described below. Each section maps to a numbered step in `.env.example`.

### Required — Database (Neon)

1. Create a free project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string from the dashboard
3. Set `DATABASE_URL`

```text
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
```

### Required — Auth secret

Generate a random secret (minimum 32 characters):

```bash
openssl rand -base64 32
```

Set the output as `BETTER_AUTH_SECRET`.

### Required — GitHub OAuth

1. Go to **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set the callback URL to `http://localhost:3000/api/auth/callback/github`
3. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

For production, create a second OAuth App with your production domain as the callback URL.

> **Note:** GitHub Actions reserves `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` as built-in variables. In CI, these are mapped from `GH_CLIENT_ID` / `GH_CLIENT_SECRET` — set those as your repository secrets, not `GITHUB_*`.

### Required — Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Required — Billing (Polar.sh)

1. Create an account at [polar.sh](https://polar.sh) and create an organization
2. Create a product for your Pro tier
3. Go to **Settings → API Tokens** — create a token and set `POLAR_ACCESS_TOKEN`
4. Go to **Settings → Webhooks** — create a webhook pointing to `https://your-domain.com/api/webhook/polar`, copy the secret to `POLAR_WEBHOOK_SECRET`
5. Copy your Pro product ID to both:
   - `SAASKIT_PRO_PRODUCT_ID` — server-only, used for subscription enforcement
   - `NEXT_PUBLIC_SAASKIT_PRO_PRODUCT_ID` — client-side, used for pricing UI

### Optional — AI (theme generation, prompt enhancement)

Set `AI_PROVIDER` to one of `google` | `openai` | `anthropic` | `groq`, then set the matching key:

| Provider | Variable |
| --- | --- |
| `google` (default) | `GOOGLE_API_KEY` — [AI Studio](https://aistudio.google.com/apikey) |
| `openai` | `OPENAI_API_KEY` — [OpenAI platform](https://platform.openai.com/api-keys) |
| `anthropic` | `ANTHROPIC_API_KEY` — [Anthropic console](https://console.anthropic.com/settings/api-keys) |
| `groq` | `GROQ_API_KEY` — [Groq console](https://console.groq.com/keys) |

### Optional — Google Fonts (font picker)

1. Enable the **Google Fonts Developer API** in Google Cloud Console
2. Create an API key and set `GOOGLE_FONTS_API_KEY`

### Optional — Rate limiting (Upstash / Vercel KV)

Required in production to protect AI and auth endpoints. In development, the app falls back to an in-memory store automatically.

1. Create a Redis database at [upstash.com](https://upstash.com) or use Vercel KV
2. Set `KV_REST_API_URL` and `KV_REST_API_TOKEN`

### Optional — Email (Resend)

Transactional emails (welcome, password reset, verification) are silently skipped if not configured.

1. Get an API key at [resend.com](https://resend.com)
2. Set `RESEND_API_KEY` and `EMAIL_FROM`

### Optional — Analytics (PostHog)

```text
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Optional — Error tracking (Sentry)

```text
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
```

### Optional — Admin panel

Comma-separated list of email addresses that can access `/admin`. Leave blank to disable the admin panel entirely.

```text
ADMIN_EMAILS="you@example.com,colleague@example.com"
```

---

## 3. Database Setup

### First-time setup

Push the full schema directly to your Neon database (no migration files needed for a fresh DB):

```bash
pnpm db:push
```

### Schema change workflow (production / team)

```bash
# 1. Edit db/schema.ts
# 2. Generate a migration file
pnpm db:generate

# 3. Commit the file in drizzle/
# 4. Apply on deploy
pnpm db:migrate
```

Never use `db:push` in production — it can silently drop columns.

### Available database scripts

| Script | What it does |
| --- | --- |
| `pnpm db:generate` | Generate a SQL migration file from schema changes |
| `pnpm db:migrate` | Apply all pending migrations from `drizzle/` |
| `pnpm db:push` | Push schema directly to DB without a migration file (dev only) |
| `pnpm db:pull` | Introspect the live DB and update the local schema |
| `pnpm db:studio` | Open Drizzle Studio at `https://local.drizzle.studio` |
| `pnpm db:check` | Check for conflicts in the migration history |
| `pnpm db:drop` | Remove a migration from the journal (use with care) |

### Reset / wipe all data

To completely wipe the database and start fresh:

1. Open your [Neon dashboard](https://console.neon.tech) → **SQL Editor**
2. Run:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

3. Re-apply the schema:

```bash
pnpm db:push
```

---

## 4. Rebrand / Customize App Name

All brand strings are centralized. To rename the product, edit only these files:

### `config/site.ts`

Change `name`, `url`, `tagline`, `description`, `email`, `links`, and `proTier`. Every page title, metadata tag, email template, footer link, and AI persona derives from this file automatically.

### `.env.local`

Update `BASE_URL` (your production domain) and `EMAIL_FROM`.

### `public/live-preview.js`

Update the `ALLOWED_ORIGINS` array — this is plain JS and cannot import from `config/site.ts`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com', 'http://localhost:3000'];
```

Run `pnpm minify-live-preview` after editing to regenerate `live-preview.min.js`.

### `package.json`

Update the `name` field (currently `launchkit`).

That is all — no other files need touching for a full rebrand.

---

## 5. Run Locally

```bash
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

On first run, also generate the theme registry (this runs automatically before `pnpm build` but not before `pnpm dev`):

```bash
pnpm generate-theme-registry
```

---

## 6. OAuth 2.0 Server (Third-party Integrations)

If you want external apps to connect to LaunchKit via OAuth 2.0, register a client using the admin script:

```bash
pnpm create-oauth-app \
  --name "My External App" \
  --redirect-uris "https://myapp.com/callback" \
  --scopes "themes:read,profile:read"
```

Save the printed `Client Secret` — it is shown only once and cannot be retrieved again.

See [docs/oauth-api.md](docs/oauth-api.md) for the full API reference.

---

## 7. Testing

### Run e2e tests

Playwright tests require the app to be running:

```bash
# Terminal 1 — build and start the production server
pnpm build && pnpm start

# Terminal 2 — run tests
pnpm e2e
```

For authenticated tests (settings, dashboard), set these in `.env.local`:

```text
E2E_TEST_EMAIL="test@example.com"
E2E_TEST_PASSWORD="yourpassword"
```

These should be a real account in your database. Tests skip gracefully if not set.

### Audit route coverage

```bash
pnpm test:coverage-audit        # exits 1 if any route has no test coverage
pnpm test:coverage-audit:warn   # same, exits 0 (CI warning only)
```

See [docs/testing.md](docs/testing.md) and [docs/test-plan.md](docs/test-plan.md) for the full test strategy.

---

## 8. Deploy to Vercel

All deploys go through GitHub Actions (Vercel Git integration is disabled in `vercel.json`).

### First-time Vercel setup

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com) — connect your GitHub repo
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Set `BASE_URL` to your production URL (e.g. `https://myapp.com`)

### OAuth callback URLs (production)

Update the authorized redirect URIs in each OAuth provider to include your production domain:

- **GitHub:** `https://your-domain.com/api/auth/callback/github`
- **Google:** `https://your-domain.com/api/auth/callback/google`

### Polar webhook (production)

Update your Polar webhook URL to `https://your-domain.com/api/webhook/polar`.

### GitHub repository secrets (required for CI)

Add these secrets under **Repository Settings → Secrets → Actions**:

| Secret | Description |
| --- | --- |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel organization or user ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `E2E_DATABASE_URL` | Separate test DB connection string |
| `BETTER_AUTH_SECRET` | Same value as in production |
| `GH_CLIENT_ID` / `GH_CLIENT_SECRET` | GitHub OAuth app credentials (not `GITHUB_*`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` | Polar credentials |
| `SAASKIT_PRO_PRODUCT_ID` | Polar Pro product ID |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | Credentials for authenticated e2e tests |

### Verify before deploying

```bash
pnpm build
```

---

## Environment Variable Reference

| Variable | Required | Description |
| --- | --- | --- |
| `BASE_URL` | Yes | Full app URL — `http://localhost:3000` locally, production domain in CI |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Session encryption key (min 32 chars) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `POLAR_ACCESS_TOKEN` | Yes | Polar.sh API token |
| `POLAR_WEBHOOK_SECRET` | Yes | Polar.sh webhook signing secret |
| `SAASKIT_PRO_PRODUCT_ID` | Yes | Polar Pro product ID (server-only) |
| `NEXT_PUBLIC_SAASKIT_PRO_PRODUCT_ID` | Yes | Polar Pro product ID (client-side UI) |
| `AI_PROVIDER` | No | `google` \| `openai` \| `anthropic` \| `groq` (default: `google`) |
| `GOOGLE_API_KEY` | No | Google Gemini key (required if `AI_PROVIDER=google`) |
| `OPENAI_API_KEY` | No | OpenAI key (required if `AI_PROVIDER=openai`) |
| `ANTHROPIC_API_KEY` | No | Anthropic key (required if `AI_PROVIDER=anthropic`) |
| `GROQ_API_KEY` | No | Groq key (required if `AI_PROVIDER=groq`) |
| `GOOGLE_FONTS_API_KEY` | No | Google Fonts API key (font picker) |
| `KV_REST_API_URL` | No | Upstash Redis REST URL (rate limiting — required in production) |
| `KV_REST_API_TOKEN` | No | Upstash Redis REST token (rate limiting — required in production) |
| `RESEND_API_KEY` | No | Resend API key (emails skipped if not set) |
| `EMAIL_FROM` | No | From address for transactional emails |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog ingest host (default: `https://app.posthog.com`) |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error monitoring |
| `SENTRY_ORG` | No | Sentry organization slug |
| `SENTRY_PROJECT` | No | Sentry project slug |
| `ADMIN_EMAILS` | No | Comma-separated admin email addresses (grants `/admin` access) |
| `E2E_TEST_EMAIL` | No | Email for authenticated Playwright tests |
| `E2E_TEST_PASSWORD` | No | Password for authenticated Playwright tests |
