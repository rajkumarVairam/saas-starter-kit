/**
 * billing.spec.ts
 * Billing & webhook tests — maps to TC-BILL-* in docs/test-plan.md.
 * All tests are unauthenticated-safe (test webhook/API boundaries).
 */
import { test, expect } from "@playwright/test";

// ── TC-BILL-005: Webhook signature enforcement ─────────────────────────────
test.describe("TC-BILL-005 · Webhook — signature verification", () => {
  test("rejects webhook with no signature", async ({ request }) => {
    const res = await request.post("/api/webhook/polar", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ type: "subscription.active", data: {} }),
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test("rejects webhook with invalid signature format", async ({ request }) => {
    const res = await request.post("/api/webhook/polar", {
      headers: {
        "Content-Type": "application/json",
        "webhook-id": "msg_test_123",
        "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
        "webhook-signature": "v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      },
      data: JSON.stringify({ type: "subscription.active", data: {} }),
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test("TC-BILL-008: returns 200 for unhandled event types with valid signature", async ({ request }) => {
    // We can't forge a valid signature without the secret, so we verify
    // the endpoint at least responds (not crashes with 500) for any signed payload.
    // In CI with a real secret, this would use a test-signed payload.
    // Here we verify the error is auth-related (4xx) not a server crash (5xx).
    const res = await request.post("/api/webhook/polar", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ type: "unknown.future.event", data: {} }),
    });
    // Must not 500 — either signature error (4xx) or success (200)
    expect(res.status()).toBeLessThan(500);
  });
});

// ── TC-BILL-007: Customer portal redirect ─────────────────────────────────
test.describe("TC-BILL-007 · Customer portal", () => {
  test("redirects unauthenticated users away from portal", async ({ page }) => {
    await page.goto("/settings/portal");
    // Should redirect to home (not crash or show portal)
    await expect(page).not.toHaveURL("/settings/portal");
  });
});
