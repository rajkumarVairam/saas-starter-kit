/**
 * api.spec.ts
 * Public and bearer-token-protected API routes.
 */
import { test, expect } from "@playwright/test";

test.describe("OAuth 2.0 API", () => {
  test("GET /api/oauth/app-info returns 400 without client_id", async ({ request }) => {
    const res = await request.get("/api/oauth/app-info");
    expect([400, 404]).toContain(res.status());
  });

  test("GET /api/oauth/userinfo returns 401 without bearer token", async ({ request }) => {
    const res = await request.get("/api/oauth/userinfo");
    expect(res.status()).toBe(401);
  });
});

test.describe("REST API v1 — bearer token required", () => {
  test("GET /api/v1/me returns 401 without token", async ({ request }) => {
    const res = await request.get("/api/v1/me");
    expect(res.status()).toBe(401);
  });

  test("GET /api/v1/themes returns 401 without token", async ({ request }) => {
    const res = await request.get("/api/v1/themes");
    expect(res.status()).toBe(401);
  });

  test("invalid bearer token is rejected", async ({ request }) => {
    const res = await request.get("/api/v1/me", {
      headers: { Authorization: "Bearer invalid-token-xyz" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Webhook endpoint", () => {
  test("POST /api/webhook/polar returns 400 without valid signature", async ({ request }) => {
    const res = await request.post("/api/webhook/polar", {
      data: { type: "subscription.created" },
    });
    // Should reject without valid Polar signature header
    expect([400, 401, 403]).toContain(res.status());
  });
});
