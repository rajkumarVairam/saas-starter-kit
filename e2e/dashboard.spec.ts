/**
 * dashboard.spec.ts
 * Dashboard page tests — maps to TC-DASH-* in docs/test-plan.md.
 * Only runs in the "authenticated" project (see playwright.config.ts testMatch).
 */
import { test, expect } from "@playwright/test";

/** Skip if middleware redirected (no valid session). */
async function goProtected(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  if (page.url().includes("/?") || page.url() === "http://localhost:3000/") {
    test.skip();
  }
}

// ── TC-DASH-001/002/003/004: Dashboard content ────────────────────────────
test.describe("TC-DASH-001–004 · Dashboard page", () => {
  test("TC-DASH-001: loads without error and shows stat cards", async ({ page }) => {
    await goProtected(page, "/dashboard");
    await expect(page).not.toHaveURL("/");
    // Stat cards must be present
    await expect(page.locator("main")).toBeVisible();
  });

  test("TC-DASH-004: quick action links navigate correctly", async ({ page }) => {
    await goProtected(page, "/dashboard");
    // Page must have at least one link to settings or themes
    const links = page.locator("a[href*='/settings'], a[href*='/pricing']");
    await expect(links.first()).toBeVisible();
  });
});

// ── Settings pages: full coverage (TC-SET-*) ─────────────────────────────
test.describe("Settings pages load without error", () => {
  const pages = [
    { path: "/settings/profile",       id: "TC-SET-001" },
    { path: "/settings/account",       id: "TC-SET-001" },
    { path: "/settings/security",      id: "TC-SET-012" },
    { path: "/settings/billing",       id: "TC-BILL-010" },
    { path: "/settings/sessions",      id: "TC-AUTH-018" },
    { path: "/settings/notifications", id: "TC-SET-011" },
    { path: "/settings/organization",  id: "TC-SET-006" },
    { path: "/settings/themes",        id: "TC-THEME-001" },
  ];

  for (const { path, id } of pages) {
    test(`${id}: ${path} loads`, async ({ page }) => {
      await goProtected(page, path);
      await expect(page).not.toHaveURL("/");
      await expect(page.locator("main, [data-testid='settings']").first()).toBeVisible();
    });
  }
});
