/**
 * admin.spec.ts
 * Admin access control — unauthenticated and non-admin users must be blocked.
 */
import { test, expect } from "@playwright/test";

test.describe("Admin — unauthenticated", () => {
  test("redirects to home", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });

  test("admin users page redirects to home", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL("/");
  });

  test("admin audit page redirects to home", async ({ page }) => {
    await page.goto("/admin/audit");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Admin API — unauthenticated", () => {
  test("GET /api/health is public", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
  });

  test("GET /api/subscription returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/subscription");
    expect(res.status()).toBe(401);
  });

  test("POST /api/generate-theme returns 401 without session", async ({ request }) => {
    const res = await request.post("/api/generate-theme", {
      data: { prompt: "dark theme" },
    });
    expect(res.status()).toBe(401);
  });
});
