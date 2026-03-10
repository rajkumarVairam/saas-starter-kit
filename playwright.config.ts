import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e configuration.
 *
 * Run all tests:          pnpm e2e
 * Run in headed mode:     pnpm e2e:headed
 * Run a single file:      pnpm e2e -- e2e/auth.spec.ts
 * Show HTML report:       pnpm e2e:report
 *
 * Test file ownership:
 *   Public (no auth):     health, public, auth, admin  → chromium + mobile-chrome
 *   Authenticated:        settings, api                → authenticated project only
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // ── Setup: mint a session once before authenticated tests ──────────────
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },

    // ── Public / unauthenticated tests ─────────────────────────────────────
    // Only run specs that do NOT require a session.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/settings.spec.ts", "**/api.spec.ts"],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: ["**/settings.spec.ts", "**/api.spec.ts"],
    },

    // ── Authenticated tests ────────────────────────────────────────────────
    // Depends on the setup project to write e2e/.auth/user.json first.
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: ["**/settings.spec.ts", "**/api.spec.ts"],
    },
  ],

  // Start the Next.js dev server automatically during local runs.
  // In CI the app should already be running (or use a preview URL).
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
