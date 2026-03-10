/**
 * auth.setup.ts
 *
 * Runs once before the "authenticated" project.
 * Attempts to sign in with a test user (email + password).
 * If no test credentials are provided, writes an empty storage state —
 * authenticated tests will then be skipped via the storageState check.
 *
 * Set these env vars for real authenticated testing:
 *   E2E_TEST_EMAIL    (default: e2e@example.com)
 *   E2E_TEST_PASSWORD (required for sign-in)
 *
 * To create a test user, sign up once manually or via the API, then
 * set E2E_TEST_EMAIL + E2E_TEST_PASSWORD in your .env.local.
 */
import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate test user", async ({ page, request }) => {
  const testEmail = process.env.E2E_TEST_EMAIL ?? "e2e@example.com";
  const testPassword = process.env.E2E_TEST_PASSWORD;

  // Ensure .auth directory exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  if (!testPassword) {
    console.warn(
      "[auth.setup] E2E_TEST_PASSWORD not set — saving empty storage state.\n" +
        "  Authenticated tests will redirect to home (expected when no credentials).\n" +
        "  Set E2E_TEST_EMAIL + E2E_TEST_PASSWORD in .env.local to fully enable them."
    );
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  // Sign in via the email+password API endpoint directly (faster than UI flow)
  const res = await request.post("/api/auth/sign-in/email", {
    data: { email: testEmail, password: testPassword },
  });

  if (!res.ok()) {
    console.warn(
      `[auth.setup] Sign-in failed (${res.status()}) — saving empty storage state.\n` +
        `  Make sure a user with email "${testEmail}" exists in the database.`
    );
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  // Navigate to a protected page to confirm the session cookie is active
  await page.goto("/settings/profile");
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`[auth.setup] Authenticated as ${testEmail}, storage state saved.`);
});
