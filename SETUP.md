# Setup Guide — New App Migration

This guide covers everything needed to run this SaaS kit as a fresh application from scratch.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Git**

---

## 1. Clone and Install

```bash
git clone <your-repo-url> my-app
cd my-app
pnpm install
```

Remove the deprecated `cuid` package (replaced with `crypto.randomUUID()` throughout the codebase):

```bash
pnpm remove cuid
```

---

## 2. Environment Variables

Copy the example file and fill in all values:

```bash
cp .env.example .env.local
```

### Required Services and How to Get Each Key

#### Database — Neon (PostgreSQL)
1. Create a free project at [console.neon.tech](https://console.neon.tech/)
2. Copy the connection string from the Dashboard
3. Set `DATABASE_URL`

#### Auth — better-auth
Generate a strong secret (minimum 32 characters):
```bash
openssl rand -base64 32
```
Set `BETTER_AUTH_SECRET` to the output.

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
3. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

For production, create a second OAuth App with your production domain.

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

#### AI — Google Gemini
1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set `GOOGLE_API_KEY`

#### AI — Groq (optional, for fast inference)
1. Get an API key from [Groq Console](https://console.groq.com/keys)
2. Set `GROQ_API_KEY`

#### Google Fonts
1. Enable the Google Fonts Developer API in [Google Cloud Console](https://console.cloud.google.com/)
2. Create an API key and set `GOOGLE_FONTS_API_KEY`

#### Payments — Polar.sh
1. Create an account at [polar.sh](https://polar.sh)
2. Create an organization and a Pro product
3. Go to Settings > API Tokens — create a token with full access and set `POLAR_ACCESS_TOKEN`
4. Go to Settings > Webhooks — create a webhook pointing to `https://your-domain.com/api/webhook/polar`
   - Set the secret and copy it to `POLAR_WEBHOOK_SECRET`
5. Copy your Pro product ID from the product URL or API and set:
   - `SAASKIT_PRO_PRODUCT_ID` — **server-only**, used for subscription enforcement
   - `NEXT_PUBLIC_SAASKIT_PRO_PRODUCT_ID` — **client-side**, used for pricing UI display

#### Rate Limiting — Upstash (via Vercel KV)
1. Create a free Redis database at [upstash.com](https://upstash.com)
   - Or use Vercel KV (which is powered by Upstash)
2. Copy the REST URL and token:
   - Set `KV_REST_API_URL`
   - Set `KV_REST_API_TOKEN`

---

## 3. Database Setup

### Available DB scripts

| Script | What it does |
| --- | --- |
| `pnpm db:generate` | Generate a new SQL migration file from schema changes |
| `pnpm db:migrate` | Apply all pending migrations from the `drizzle/` folder to the DB |
| `pnpm db:push` | Push schema directly to DB without a migration file (dev only) |
| `pnpm db:pull` | Introspect the live DB and update your local schema file |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) in the browser |
| `pnpm db:check` | Check for conflicts or issues in your migration history |
| `pnpm db:drop` | Remove a specific migration from the journal (use with care) |

### First-time setup (new app)

For a brand new database, push the full schema directly:

```bash
pnpm db:push
```

### Production / team workflow

Generate a migration file, commit it, then apply it on deploy:

```bash
# 1. After changing db/schema.ts, generate the migration
pnpm db:generate

# 2. Commit the generated file in drizzle/
# 3. On deploy (or manually), apply migrations
pnpm db:migrate
```

### Rollback

Drizzle does not auto-rollback. To undo a migration:

1. Write a new migration SQL file that reverses the change
2. Run `pnpm db:generate` to register it, then `pnpm db:migrate`
3. Or use `pnpm db:drop` to remove a bad migration from the journal before it is applied

### Reset / wipe all tables

To completely wipe your database and start fresh (destroys all data):

1. Go to your [Neon dashboard](https://console.neon.tech/) → **SQL Editor**
1. Run:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

1. Re-apply the schema:

```bash
pnpm db:push
```

### Inspect the DB

```bash
pnpm db:studio
```

Opens a local browser UI at `https://local.drizzle.studio` to browse and edit data.

If you are migrating from a previous version of this codebase, migration `0005_security_fixes.sql` converts the `ai_usage.days_since_epoch` column from `text` to `integer` and adds an index on `subscription.userId`. Make sure this migration runs before starting the app.

---

## 4. Branding / App Name

All brand strings are centralized. To rebrand for a new product, edit **only these files**:

### 1. `config/site.ts`

Change `name`, `url`, `ogImage`, `tagline`, `description`, `creator`, `email`, `links`, and `proTier`.
Every page title, metadata tag, email template, footer link, social icon, share URL, and AI persona derives from this file automatically.

### 2. `.env.local`

Update `BASE_URL` (your production domain), `EMAIL_FROM`, and all service secrets.

### 3. `public/live-preview.js` and `public/live-preview.min.js`

Update the `ALLOWED_ORIGINS` array (plain JS — cannot import from `config/site.ts`):

```js
const ALLOWED_ORIGINS = ['https://your-domain.com', 'http://localhost:3000'];
```

### 4. `package.json`

Update the `name` field (currently `launchkit`).

That's it. No other files need to be touched for a full rebrand.

---

## 5. Run Locally

```bash
pnpm dev
```

App will be available at [http://localhost:3000](http://localhost:3000).

For the first run, also regenerate the theme registry:

```bash
pnpm generate-theme-registry
```

---

## 6. OAuth Apps for Third-Party Integrations (Optional)

If you want to allow external apps to connect via OAuth 2.0, use the admin script to create an OAuth app entry:

```bash
npx tsx scripts/create-oauth-app.ts \
  --name "My External App" \
  --redirect-uris "https://myapp.com/callback" \
  --scopes "themes:read,profile:read"
```

Save the printed `Client Secret` — it cannot be retrieved again.

---

## 7. Production Deployment (Vercel)

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Update OAuth callback URLs in GitHub and Google to use your production domain
5. Update the Polar webhook URL to your production domain
6. Set `BASE_URL` to your production URL (e.g. `https://myapp.com`)

```bash
# Build locally to verify before deploying
pnpm build
```

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | Yes | Full URL of your app (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret key for session encryption (min 32 chars) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `AI_PROVIDER` | No | AI provider: `google` \| `openai` \| `anthropic` \| `groq` (default: `google`) |
| `GOOGLE_API_KEY` | No | Google Gemini API key (required if `AI_PROVIDER=google`) |
| `OPENAI_API_KEY` | No | OpenAI API key (required if `AI_PROVIDER=openai`) |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (required if `AI_PROVIDER=anthropic`) |
| `GROQ_API_KEY` | No | Groq API key (required if `AI_PROVIDER=groq`) |
| `GOOGLE_FONTS_API_KEY` | No | Google Fonts API key (required for font picker) |
| `POLAR_ACCESS_TOKEN` | Yes | Polar.sh API token |
| `POLAR_WEBHOOK_SECRET` | Yes | Polar.sh webhook signing secret |
| `SAASKIT_PRO_PRODUCT_ID` | Yes | Polar product ID — server-only, never expose |
| `NEXT_PUBLIC_SAASKIT_PRO_PRODUCT_ID` | Yes | Same product ID — client-side for UI display |
| `KV_REST_API_URL` | No | Upstash Redis REST URL (rate limiting, required in production) |
| `KV_REST_API_TOKEN` | No | Upstash Redis REST token (rate limiting, required in production) |
| `RESEND_API_KEY` | No | Resend API key (emails skipped if not set) |
| `EMAIL_FROM` | No | From address for transactional emails |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog ingest host (default: `https://app.posthog.com`) |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error monitoring |
| `SENTRY_ORG` | No | Sentry organization slug |
| `SENTRY_PROJECT` | No | Sentry project slug |
| `ADMIN_EMAILS` | No | Comma-separated admin email addresses (grants access to `/admin`) |
