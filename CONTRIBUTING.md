# Contributing to SaaS Kit v3

Thanks for your interest in contributing to SaaS Kit v3! We're excited to have you here.

Please take a moment to review this document before submitting your first pull request.

## About This Project

SaaS Kit v3 is a production-ready Next.js SaaS starter that includes a visual theme editor for Tailwind CSS & shadcn/ui components, authentication, billing, AI theme generation, and more.

## Project Structure

```
├── actions/          # Next.js Server Actions
├── app/
    ├── (auth)/       # Authentication routes
    ├── (legal)/      # Legal pages (privacy policy)
    ├── api/          # Public API endpoints
    ├── dashboard/    # User dashboard (saved themes)
    ├── editor/       # Main theme editor route
    ├── layout.tsx    # Root application layout
    └── page.tsx      # Landing page route
├── components/
    ├── editor/       # Theme editor interface components
    ├── examples/     # Demo components for theme previews
    ├── home/         # Landing page components
    └── ui/           # Base shadcn/ui components
├── config/           # App configuration & default values
├── db/               # Database schema & logic (Drizzle ORM)
├── hooks/            # Custom React hooks
├── lib/              # 3rd-party library integrations & helpers
├── public/
    └── r/            # Holds JSON files for the theme registry
├── scripts/          # Utility scripts used during development
├── store/            # Global state management (Zustand)
└── utils/            # General utility functions and helpers
```

## Prerequisites

- Node.js 22+
- pnpm

## Setup

1. Clone your fork and install dependencies:

    ```bash
    git clone https://github.com/YOUR_ORG/launchkit.git
    cd launchkit
    pnpm install
    ```

2. Set up environment variables:

    ```bash
    cp .env.example .env.local
    ```
    Fill in your credentials. See [SETUP.md](SETUP.md) for detailed instructions.

3. Push the database schema:

    ```bash
    pnpm db:push
    ```

4. Start the development server:

    ```bash
    pnpm dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Submitting Changes

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test them locally
3. Commit with a descriptive message following Conventional Commits:
   - `feat(editor): Add contrast checker component`
   - `fix(auth): Correct GitHub redirect URL`
   - `docs(readme): Update setup instructions`
4. Push and open a Pull Request

## Troubleshooting

If you hit issues after pulling new changes:

```bash
# Stop dev server, then:
rm -rf node_modules .next
pnpm install
pnpm db:push
pnpm dev
```

Thank you for contributing!
