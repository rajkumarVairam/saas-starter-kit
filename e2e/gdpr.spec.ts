/**
 * gdpr.spec.ts
 * GDPR & data portability tests — maps to TC-GDPR-* in docs/test-plan.md.
 *
 * Unauthenticated checks (001, 002) run in all projects.
 * Authenticated checks (003+) only run in the "authenticated" project.
 */
import { test, expect } from "@playwright/test";

// ── TC-GDPR-001 / 002: Export endpoint auth enforcement ───────────────────
test.describe("TC-GDPR-002 · Data export — unauthenticated", () => {
  test("GET /api/user/export returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/user/export");
    expect(res.status()).toBe(401);
  });

  test("export response body does not leak user data when unauthenticated", async ({ request }) => {
    const res = await request.get("/api/user/export");
    const body = await res.json();
    // Must not contain any user fields
    expect(body).not.toHaveProperty("user");
    expect(body).not.toHaveProperty("sessions");
    expect(body).not.toHaveProperty("aiUsage");
  });

  test("export ignores userId query param when unauthenticated", async ({ request }) => {
    const res = await request.get("/api/user/export?userId=any-user-id");
    expect(res.status()).toBe(401);
  });
});

// ── TC-GDPR-001: Export structure (requires auth) ─────────────────────────
test.describe("TC-GDPR-001 · Data export — authenticated", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("returns correct content-type and content-disposition", async ({ request }) => {
    const res = await request.get("/api/user/export");
    if (res.status() === 401) { test.skip(); return; } // no session in storage

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/json");
    expect(res.headers()["content-disposition"]).toContain("attachment");
    expect(res.headers()["content-disposition"]).toContain("data-export");
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("export payload has required top-level keys", async ({ request }) => {
    const res = await request.get("/api/user/export");
    if (res.status() === 401) { test.skip(); return; }

    const body = await res.json();
    expect(body).toHaveProperty("exportedAt");
    expect(body).toHaveProperty("exportVersion");
    expect(body).toHaveProperty("user");
    expect(body).toHaveProperty("linkedAccounts");
    expect(body).toHaveProperty("sessions");
    expect(body).toHaveProperty("themes");
    expect(body).toHaveProperty("aiUsage");
    expect(body).toHaveProperty("subscriptions");
    expect(body).toHaveProperty("auditLog");
  });

  test("TC-GDPR-019: export does not contain sensitive fields", async ({ request }) => {
    const res = await request.get("/api/user/export");
    if (res.status() === 401) { test.skip(); return; }

    const text = await res.text();
    // Passwords, tokens, and 2FA secrets must never appear in the export
    expect(text).not.toContain('"password"');
    expect(text).not.toContain('"accessToken"');
    expect(text).not.toContain('"refreshToken"');
    expect(text).not.toContain('"secret"'); // twoFactor secret
    expect(text).not.toContain('"idToken"');
  });
});
