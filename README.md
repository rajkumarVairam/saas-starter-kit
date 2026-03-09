<div align="center">
  <h1>LaunchKit</h1>
  <p>A production-ready Next.js SaaS starter with auth, billing, theming, and everything you need to launch fast.</p>
</div>

<br />

## Features

- Theme preset selector (25+ built-in themes)
- Subscription billing with Polar
- Authentication with Better Auth (GitHub + Google OAuth)
- PostgreSQL database with Drizzle ORM
- Admin panel with analytics, user list, and audit log
- Rate limiting with Upstash/Vercel KV
- Figma integration

## Getting Started

See [SETUP.md](SETUP.md) for full setup instructions including database, authentication, billing, and deployment.

### Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your credentials in .env.local

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Better Auth
- **Payments**: Polar
- **Rate Limiting**: Upstash / Vercel KV

## Attribution

This project includes code derived from [tweakcn](https://github.com/jnsahaj/tweakcn) by Sahaj Jain,
licensed under the Apache License 2.0. See [NOTICE](NOTICE) for full attribution details.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
