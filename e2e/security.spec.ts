/**
 * security.spec.ts
 * Automated security tests — maps to SEC-* cases in docs/test-plan.md.
 *
 * These run unauthenticated (no storageState) and verify that:
 *   - Protected routes cannot be accessed without a session
 *   - APIs reject missing/forged credentials
 *   - Webhooks enforce signature verification
 *   - Sensitive data is never leaked
 *
 * No credentials required — all tests are safe to run in CI.
 */
import { test, expect } from "@playwright/test";

// ── SEC-001: Authentication Bypass — Direct URL Access ─────────────────────
test.describe("SEC-001 · Auth bypass — unauthenticated direct access", () => {
  const protectedPages = [
    "/dashboard",
    "/settings/profile",
    "/settings/account",
    "/settings/security",
    "/settings/billing",
    "/settings/sessions",
    "/settings/notifications",
    "/settings/organization",
  ];

  for (const path of protectedPages) {
    test(`${path} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(path);
      // Must not render the page — should land on home or login
      await expect(page).not.toHaveURL(path);
      expect(page.url()).not.toContain("/settings");
      expect(page.url()).not.toContain("/dashboard");
    });
  }
});

// ── SEC-002: Admin Privilege Escalation ───────────────────────────────────
test.describe("SEC-002 · Admin access — unauthenticated", () => {
  const adminPages = ["/admin", "/admin/users", "/admin/audit", "/admin/analytics", "/admin/community"];

  for (const path of adminPages) {
    test(`${path} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(path);
      await expect(page).not.toHaveURL(new RegExp("^.*" + path));
    });
  }
});

// ── SEC-003/004: IDOR — API endpoints require auth ─────────────────────────
test.describe("SEC-003/004 · IDOR — API endpoints reject missing auth", () => {
  test("GET /api/user/export returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/user/export");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).not.toHaveProperty("user");
    expect(body).not.toHaveProperty("sessions");
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

  test("POST /api/enhance-prompt returns 401 without session", async ({ request }) => {
    const res = await request.post("/api/enhance-prompt", {
      data: { prompt: "improve this" },
    });
    expect(res.status()).toBe(401);
  });
});

// ── SEC-008: Webhook Signature Verification ────────────────────────────────
test.describe("SEC-008 · Webhook — signature enforcement", () => {
  test("rejects webhook with no signature headers", async ({ request }) => {
    const res = await request.post("/api/webhook/polar", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ type: "subscription.active", data: {} }),
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test("rejects webhook with forged signature", async ({ request }) => {
    const res = await request.post("/api/webhook/polar", {
      headers: {
        "Content-Type": "application/json",
        "webhook-id": "fake-id",
        "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
        "webhook-signature": "v1,invalidsignaturehere",
      },
      data: JSON.stringify({ type: "subscription.active", data: {} }),
    });
    expect([400, 401, 403]).toContain(res.status());
  });
});

// ── SEC-009: Bearer Token Auth — v1 API ────────────────────────────────────
test.describe("SEC-009 · Bearer token enforcement", () => {
  test("GET /api/v1/me returns 401 without token", async ({ request }) => {
    const res = await request.get("/api/v1/me");
    expect(res.status()).toBe(401);
  });

  test("GET /api/v1/themes returns 401 without token", async ({ request }) => {
    const res = await request.get("/api/v1/themes");
    expect(res.status()).toBe(401);
  });

  test("GET /api/v1/me returns 401 with invalid token", async ({ request }) => {
    const res = await request.get("/api/v1/me", {
      headers: { Authorization: "Bearer this-is-not-a-valid-token" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/v1/themes returns 401 with malformed bearer", async ({ request }) => {
    const res = await request.get("/api/v1/themes", {
      headers: { Authorization: "Token invalid-format" },
    });
    expect(res.status()).toBe(401);
  });
});

// ── SEC-010: OAuth endpoint security ──────────────────────────────────────
test.describe("SEC-010/011 · OAuth endpoint security", () => {
  test("GET /api/oauth/app-info returns 400 without client_id", async ({ request }) => {
    const res = await request.get("/api/oauth/app-info");
    expect(res.status()).toBe(400);
  });

  test("GET /api/oauth/userinfo returns 401 without bearer token", async ({ request }) => {
    const res = await request.get("/api/oauth/userinfo");
    expect(res.status()).toBe(401);
  });

  test("POST /api/oauth/token returns 400 with missing grant_type", async ({ request }) => {
    const res = await request.post("/api/oauth/token", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: "code=fake&redirect_uri=http://localhost:3000",
    });
    expect([400, 401]).toContain(res.status());
  });
});

// ── SEC-016: No secrets in public responses ────────────────────────────────
test.describe("SEC-016 · Sensitive data not exposed publicly", () => {
  test("health check does not expose internal config", async ({ request }) => {
    const res = await request.get("/api/health");
    const text = await res.text();
    // Must not contain connection strings or secret-like values
    expect(text).not.toContain("postgresql://");
    expect(text).not.toContain("DATABASE_URL");
    expect(text).not.toContain("SECRET");
    expect(text).not.toContain("password");
  });

  test("404 page does not expose stack traces", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-12345");
    const body = await page.content();
    expect(body).not.toContain("at Object.<anonymous>");
    expect(body).not.toContain("node_modules");
  });
});

// ── SEC-017: Account enumeration prevention ────────────────────────────────
test.describe("SEC-017 · Account enumeration", () => {
  test("password reset returns same response for unknown email", async ({ request }) => {
    const res = await request.post("/api/auth/request-password-reset", {
      data: {
        email: "definitely-not-registered-xyz123@nonexistent.com",
        redirectTo: "http://localhost:3000/reset",
      },
    });
    // Must not return 404 (which would confirm email doesn't exist)
    expect(res.status()).toBeLessThan(500);
    expect(res.status()).not.toBe(404);
  });
});

// ── AUTH endpoint validation ───────────────────────────────────────────────
test.describe("Auth API — input validation", () => {
  test("sign-in returns 400/422 for empty body", async ({ request }) => {
    const res = await request.post("/api/auth/sign-in/email", { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  test("sign-up returns 400/422 for empty body", async ({ request }) => {
    const res = await request.post("/api/auth/sign-up/email", { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  test("sign-up returns 400 for short password", async ({ request }) => {
    const res = await request.post("/api/auth/sign-up/email", {
      data: { email: "test@example.com", password: "short", name: "Test" },
    });
    expect([400, 422]).toContain(res.status());
  });
});
