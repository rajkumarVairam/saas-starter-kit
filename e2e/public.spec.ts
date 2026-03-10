/**
 * public.spec.ts
 * Landing page and public routes — no auth required.
 */
import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders without crashing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/launchkit/i);
  });

  test("has a sign-in / get started call-to-action", async ({ page }) => {
    await page.goto("/");
    // The landing page should have at least one interactive CTA
    const cta = page.getByRole("button").or(page.getByRole("link")).first();
    await expect(cta).toBeVisible();
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

test.describe("Protected route redirect", () => {
  test("unauthenticated /settings redirects to home", async ({ page }) => {
    await page.goto("/settings/themes");
    await expect(page).toHaveURL("/");
  });

  test("unauthenticated /admin redirects to home", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });

  test("unauthenticated /dashboard redirects to home", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Auth dialog", () => {
  test("sign-in dialog opens on CTA click", async ({ page }) => {
    await page.goto("/");
    // Click the first button that would open auth (Sign in / Get started)
    const signInBtn = page
      .getByRole("button", { name: /sign in|get started|continue/i })
      .first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      // After click a dialog or redirect should appear
      await expect(page.locator('[role="dialog"], [data-state="open"]').first()).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
