<div align="center">
  <h1>LaunchKit</h1>
  <p>Production-ready Next.js 15 SaaS starter — auth, billing, AI, theming, and admin panel built in so you can focus on your product.</p>
</div>

<br />

## Features

- **Authentication** — Email/password, GitHub & Google OAuth, magic link, email OTP, SMS/phone, two-factor (TOTP + backup codes), session management
- **Billing** — Polar.sh subscriptions, webhook signature verification, customer portal, Pro gating
- **Theme editor** — 25+ built-in presets, AI-powered theme generation, Google Fonts picker, Figma export, live preview
- **Admin panel** — User management (ban/unban/delete), analytics, audit log, community
- **Public REST API** — Bearer-token authenticated `/api/v1/` endpoints, OAuth 2.0 server for third-party integrations
- **GDPR** — One-click data export (JSON), account deletion
- **Observability** — Sentry error tracking, PostHog analytics, structured audit logging
- **Rate limiting** — Upstash Redis (in-memory fallback for dev)
- **E2E test suite** — Playwright with 10 spec files covering auth, security, billing, GDPR, admin, settings, public routes
- **CI/CD** — GitHub Actions: lint + type-check + build, Vercel deploy, Playwright e2e

## Quick Start

```bash
# 1. Install dependencies (pnpm only)
pnpm install

# 2. Copy and fill in environment variables
cp .env.example .env.local

# 3. Push database schema (first time)
pnpm db:push

# 4. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). See [SETUP.md](SETUP.md) for the full setup guide including OAuth, billing, and deployment.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15.4 (App Router, Turbopack) · React 19 |
| Styling | Tailwind CSS v4 · shadcn/ui |
| Database | Neon PostgreSQL (serverless) · Drizzle ORM |
| Auth | Better Auth v1.2 |
| Billing | Polar.sh |
| AI | Vercel AI SDK — Google Gemini / OpenAI / Anthropic / Groq |
| Rate limiting | Upstash Redis / Vercel KV |
| Email | Resend |
| Analytics | PostHog |
| Error tracking | Sentry |
| Testing | Playwright |

## Project Structure

```text
├── actions/            # Next.js Server Actions (admin, billing, auth)
├── app/
│   ├── (auth)/         # Sign-in, sign-up, reset password, 2FA, verify
│   ├── admin/          # Admin panel — users, analytics, audit, community
│   ├── api/            # API routes (auth, billing, AI, v1 REST, OAuth 2.0)
│   ├── dashboard/      # User dashboard (saved themes)
│   ├── settings/       # Profile, account, security, sessions, billing, org, themes
│   ├── pricing/        # Pricing page
│   └── page.tsx        # Landing page
├── components/
│   ├── ui/             # shadcn/ui base components
│   └── ...             # App-specific components
├── config/             # Site metadata (name, URL, social links)
├── db/                 # Drizzle schema and migrations
├── docs/               # Reference docs (billing, testing, security, etc.)
├── e2e/                # Playwright e2e specs (10 files)
├── hooks/              # Custom React hooks
├── lib/                # Auth, DB, billing, email, AI, rate-limit setup
├── scripts/            # Dev utilities (theme registry, OAuth app, coverage audit)
└── store/              # Zustand global state
```

## Scripts

```bash
pnpm dev                        # Start dev server (Turbopack)
pnpm build                      # Production build (runs theme registry generation first)
pnpm lint                       # ESLint
pnpm db:push                    # Sync schema to DB (dev)
pnpm db:generate                # Generate migration file (production)
pnpm db:migrate                 # Apply migrations (production)
pnpm db:studio                  # Drizzle Studio visual browser
pnpm e2e                        # Run Playwright e2e tests
pnpm e2e:headed                 # Run with browser visible
pnpm e2e:report                 # View last test report
pnpm test:coverage-audit        # Audit route coverage — exits 1 on gaps
pnpm test:coverage-audit:warn   # Same, exits 0 (warning only)
```

## Environment Variables

All configuration lives in `.env.local`. See `.env.example` for the full template with setup instructions for each service. The minimum required variables to get started locally:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Session encryption secret (min 32 chars) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |

See [SETUP.md](SETUP.md) for all variables including billing, AI, rate limiting, email, and monitoring.

## Documentation

| Topic | File |
| --- | --- |
| Full setup guide (DB, OAuth, billing, deploy) | [SETUP.md](SETUP.md) |
| Polar billing, metering, dunning | [docs/billing.md](docs/billing.md) |
| Testing strategy, Playwright patterns | [docs/testing.md](docs/testing.md) |
| Test plan with 100+ TC-IDs | [docs/test-plan.md](docs/test-plan.md) |
| Security, Zod, Redis, API keys, webhooks | [docs/security.md](docs/security.md) |
| File uploads (R2), email templates | [docs/storage-email.md](docs/storage-email.md) |
| Background jobs, analytics, error tracking | [docs/observability.md](docs/observability.md) |
| DB production, feature flags, health checks, admin | [docs/infrastructure.md](docs/infrastructure.md) |
| Audit log, GDPR, onboarding, i18n, notifications | [docs/enterprise.md](docs/enterprise.md) |
| OAuth 2.0 server API reference | [docs/oauth-api.md](docs/oauth-api.md) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All PRs must follow the checklist in [.github/pull_request_template.md](.github/pull_request_template.md) — new routes require an e2e spec and a TC-ID in [docs/test-plan.md](docs/test-plan.md).

## Attribution

This project includes code derived from [tweakcn](https://github.com/jnsahaj/tweakcn) by Sahaj Jain, licensed under the Apache License 2.0. See [NOTICE](NOTICE) for full attribution details.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
