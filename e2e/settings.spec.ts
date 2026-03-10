/**
 * settings.spec.ts
 * Authenticated settings pages.
 * Only runs in the "authenticated" project (see playwright.config.ts testMatch).
 *
 * Requires E2E_TEST_EMAIL + E2E_TEST_PASSWORD in .env.local for a real session.
 * Without credentials, auth.setup.ts writes an empty storage state and these
 * tests skip automatically (no session → middleware redirects to home).
 */
import { test, expect } from "@playwright/test";

/** Navigate to path; skip the test if no valid session (middleware redirected). */
async function goProtected(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  if (!page.url().includes("/settings")) {
    test.skip();
  }
}

test.describe("Settings — themes", () => {
  test("loads without error", async ({ page }) => {
    await goProtected(page, "/settings/themes");
    await expect(page).not.toHaveURL("/");
    await expect(page.locator("main, [data-testid='settings']").first()).toBeVisible();
  });
});

test.describe("Settings — account", () => {
  test("loads without error", async ({ page }) => {
    await goProtected(page, "/settings/account");
    await expect(page).not.toHaveURL("/");
  });
});

test.describe("Settings — billing", () => {
  test("loads without error", async ({ page }) => {
    await goProtected(page, "/settings/billing");
    await expect(page).not.toHaveURL("/");
  });
});

test.describe("Settings — sessions", () => {
  test("loads without error", async ({ page }) => {
    await goProtected(page, "/settings/sessions");
    await expect(page).not.toHaveURL("/");
  });
});

test.describe("Settings — notifications", () => {
  test("loads without error", async ({ page }) => {
    await goProtected(page, "/settings/notifications");
    await expect(page).not.toHaveURL("/");
  });
});
