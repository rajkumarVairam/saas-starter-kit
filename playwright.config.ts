import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e configuration.
 *
 * Run all tests:          pnpm e2e
 * Run in headed mode:     pnpm e2e:headed
 * Run a single file:      pnpm e2e -- e2e/auth.spec.ts
 * Run by tag:             pnpm e2e -- --grep "SEC-"
 * Show HTML report:       pnpm e2e:report
 *
 * ── Test file ownership ──────────────────────────────────────────────────
 *
 *  UNAUTHENTICATED (chromium + mobile-chrome):
 *    health.spec.ts      — TC-API-008
 *    public.spec.ts      — landing page, redirect checks
 *    auth.spec.ts        — OAuth buttons, auth API validation
 *    admin.spec.ts       — TC-ADMIN-001/002 redirect checks
 *    security.spec.ts    — SEC-001–020 (no-auth boundary tests)
 *    billing.spec.ts     — TC-BILL-005/007/008 (webhook, portal)
 *    gdpr.spec.ts        — TC-GDPR-002 (unauthenticated export)
 *
 *  AUTHENTICATED (authenticated project only — requires session):
 *    settings.spec.ts    — TC-SET-* page load checks
 *    api.spec.ts         — Bearer token, OAuth endpoint checks
 *    dashboard.spec.ts   — TC-DASH-* dashboard checks
 *    gdpr.spec.ts        — TC-GDPR-001 (authenticated export structure)
 */

/** Specs that partially or fully require an authenticated session */
const AUTH_ONLY_SPECS = [
  "**/settings.spec.ts",
  "**/api.spec.ts",
  "**/dashboard.spec.ts",
];

/** Specs that run unauthenticated in all browser projects */
const PUBLIC_SPECS_IGNORE = AUTH_ONLY_SPECS;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["json", { outputFile: "playwright-report/results.json" }]]
    : [["html"], ["list"]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // ── Setup: mint a session once before authenticated tests ──────────────
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // ── Public / unauthenticated — Desktop Chrome ──────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: PUBLIC_SPECS_IGNORE,
    },

    // ── Public / unauthenticated — Mobile Chrome ───────────────────────────
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: PUBLIC_SPECS_IGNORE,
    },

    // ── Authenticated — Desktop Chrome ─────────────────────────────────────
    // Depends on setup to write e2e/.auth/user.json first.
    // Tests skip gracefully when no E2E_TEST_PASSWORD is set.
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: AUTH_ONLY_SPECS,
    },
  ],

  // Start the Next.js dev server automatically during local runs.
  // In CI the app is built + started separately (see e2e.yml).
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
