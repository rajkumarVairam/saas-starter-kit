# Test Plan — LaunchKit SaaS Starter Kit

> **Roles covered:** QA Engineer · Business Analyst · UAT · Infosec / Pen Tester
> **App version:** SaaS Kit v2 · Next.js 15 · Better Auth · Drizzle / Neon · Polar
> **Last updated:** 2026-03-09

---

## Table of Contents

1. [Scope & Objectives](#1-scope--objectives)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Functional Test Cases — Authentication](#3-functional-test-cases--authentication)
4. [Functional Test Cases — Settings](#4-functional-test-cases--settings)
5. [Functional Test Cases — Dashboard](#5-functional-test-cases--dashboard)
6. [Functional Test Cases — Admin Panel](#6-functional-test-cases--admin-panel)
7. [Functional Test Cases — Billing & Subscriptions](#7-functional-test-cases--billing--subscriptions)
8. [Functional Test Cases — Theme Builder](#8-functional-test-cases--theme-builder)
9. [Functional Test Cases — REST API v1 & OAuth 2.0](#9-functional-test-cases--rest-api-v1--oauth-20)
10. [Functional Test Cases — GDPR & Data Portability](#10-functional-test-cases--gdpr--data-portability)
11. [UAT — User Acceptance Scenarios](#11-uat--user-acceptance-scenarios)
12. [Security & Pen Testing](#12-security--pen-testing)
13. [Stability & Performance](#13-stability--performance)
14. [Regression Checklist](#14-regression-checklist)
15. [Known Risk Areas](#15-known-risk-areas)

---

## 1. Scope & Objectives

### In Scope
- All public and authenticated page routes
- All `/api/*` endpoints (REST, OAuth 2.0, webhooks)
- All server actions (`actions/*.ts`)
- Authentication flows: email/password, OAuth (Google, GitHub), 2FA, magic link, email OTP
- Authorization: session-based middleware, Bearer token API, admin RBAC
- Billing: Polar checkout, webhook processing, subscription lifecycle
- Data integrity: Drizzle ORM constraints, cascade deletes, FK relationships
- Security: OWASP Top 10, auth bypass, injection, CSRF, rate limiting
- GDPR: data export completeness, right to erasure

### Out of Scope
- Third-party provider internals (Google, GitHub OAuth, Polar payment processing)
- SMS delivery via Twilio (mocked in dev)
- Infrastructure (Neon, Vercel, Upstash)

### Entry Criteria
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm db:push` applied — all 24 tables present
- [ ] `.env.local` has all required vars set
- [ ] At least one test user created via email sign-up

### Exit Criteria
- [ ] All P0/P1 test cases pass
- [ ] Zero open Critical/High security findings
- [ ] `pnpm lint` and `pnpm build` clean
- [ ] `pnpm e2e` passes (or skips gracefully without credentials)

---

## 2. Test Environment Setup

### Local Dev
```bash
pnpm install
cp .env.example .env.local   # fill in all values
pnpm db:push
pnpm dev
```

### Required `.env.local` Values for Testing
| Variable | Test Value |
|---|---|
| `BASE_URL` | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | any 32+ char string |
| `DATABASE_URL` | Neon connection string (test branch) |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth app (localhost redirect registered) |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth app (localhost callback registered) |
| `POLAR_ACCESS_TOKEN` | Polar sandbox token |
| `POLAR_WEBHOOK_SECRET` | Polar sandbox webhook secret |
| `SAASKIT_PRO_PRODUCT_ID` | Polar sandbox product ID |
| `ADMIN_EMAILS` | `admin@test.com` |
| `E2E_TEST_EMAIL` | email of pre-created test user |
| `E2E_TEST_PASSWORD` | password of pre-created test user |

### Test Users Required
| Role | Email | Notes |
|---|---|---|
| Free user | `free@test.com` | No subscription |
| Pro user | `pro@test.com` | Active Polar subscription |
| Admin | `admin@test.com` | Must match `ADMIN_EMAILS` |
| Banned | `banned@test.com` | `banned = true` in DB |

---

## 3. Functional Test Cases — Authentication

### TC-AUTH-001 · Email Sign-Up — Happy Path
**Priority:** P0
**Precondition:** Email not previously registered
**Steps:**
1. Navigate to `/`
2. Click "Get Started" → "Continue with Email"
3. Enter name, email, password (8+ chars)
4. Click "Create Account"

**Expected:**
- Toast: "Account created! Check your email to verify."
- DB: row in `user` table, row in `account` table with `providerId = "credential"`
- If RESEND configured: verification email received
- If RESEND not configured: account still created, no crash

**Fail conditions:** 500 error, no DB row created, crash

---

### TC-AUTH-002 · Email Sign-Up — Duplicate Email
**Priority:** P0
**Steps:** Repeat TC-AUTH-001 with same email
**Expected:** Toast error "User already exists" or similar, HTTP 400, no duplicate DB row

---

### TC-AUTH-003 · Email Sign-Up — Weak Password
**Priority:** P1
**Steps:** Attempt sign-up with password `abc123` (7 chars)
**Expected:** Error indicating minimum 8 characters; no DB row created

---

### TC-AUTH-004 · Email Sign-In — Happy Path
**Priority:** P0
**Precondition:** TC-AUTH-001 completed
**Steps:**
1. Click "Sign In" → "Continue with Email"
2. Enter registered email + correct password
3. Submit

**Expected:** Redirected to `/dashboard`, session cookie set, `/api/auth/get-session` returns user

---

### TC-AUTH-005 · Email Sign-In — Wrong Password
**Priority:** P0
**Expected:** Toast "Invalid email or password", no session created, stays on dialog

---

### TC-AUTH-006 · Email Sign-In — Unverified Email
**Priority:** P1
**Precondition:** Sign-up with RESEND configured, don't click verify link
**Expected:** Better Auth blocks sign-in with "Email not verified" message

---

### TC-AUTH-007 · Google OAuth — Sign-In
**Priority:** P0
**Steps:**
1. Click "Continue with Google"
2. Complete Google OAuth consent
3. Redirected back

**Expected:** User created/updated in `user` table with `providerId = "google"`, session active, lands on callback URL

---

### TC-AUTH-008 · GitHub OAuth — Sign-In
**Priority:** P0
**Steps:** Same flow via GitHub
**Expected:** User row with `providerId = "github"`, session active

---

### TC-AUTH-009 · OAuth — Existing Email Conflict
**Priority:** P1
**Precondition:** User registered with email/password
**Steps:** Sign in with Google using same email
**Expected:** Better Auth links accounts OR returns clear error; no duplicate user rows

---

### TC-AUTH-010 · Password Reset — Request
**Priority:** P1
**Steps:**
1. POST `/api/auth/request-password-reset` with `{ email, redirectTo }`
2. If RESEND configured: check inbox

**Expected:** HTTP 200, reset email sent (or silently skipped if email not found to prevent enumeration)

---

### TC-AUTH-011 · Password Reset — Use Link
**Priority:** P1
**Steps:** Click reset link from email, enter new password, submit
**Expected:** Password updated in `account.password`, can sign in with new password

---

### TC-AUTH-012 · Two-Factor Authentication — Enable
**Priority:** P1
**Precondition:** Signed in
**Steps:**
1. Go to `/settings/security`
2. Click "Enable 2FA", enter current password
3. Scan QR code with authenticator app
4. Enter 6-digit TOTP code

**Expected:**
- `twoFactor` row created in DB with encrypted secret
- Backup codes displayed and downloadable
- `session.user.twoFactorEnabled = true`

---

### TC-AUTH-013 · Two-Factor Authentication — Enforce on Login
**Priority:** P1
**Precondition:** 2FA enabled (TC-AUTH-012)
**Steps:** Sign out, sign in with email/password
**Expected:** 2FA challenge screen appears; cannot access dashboard without TOTP code

---

### TC-AUTH-014 · Two-Factor Authentication — Backup Code
**Priority:** P1
**Steps:** Use a backup code instead of TOTP
**Expected:** Code accepted once; same code rejected on second use

---

### TC-AUTH-015 · Two-Factor Authentication — Disable
**Priority:** P1
**Steps:** `/settings/security` → Disable 2FA → enter password
**Expected:** `twoFactor` row deleted; login no longer requires 2FA

---

### TC-AUTH-016 · Magic Link Sign-In
**Priority:** P2
**Precondition:** RESEND configured
**Steps:** Request magic link via `/api/auth/magic-link/send`, click link in email
**Expected:** Session created without password; link expired after use

---

### TC-AUTH-017 · Email OTP — Sign-In Flow
**Priority:** P2
**Steps:** Request OTP via `/api/auth/email-otp/send-verification-otp`, submit code
**Expected:** OTP accepted once within expiry window; rejected after expiry or reuse

---

### TC-AUTH-018 · Session — List Active Sessions
**Priority:** P1
**Steps:** Go to `/settings/sessions`
**Expected:** Table shows current session (marked "this device"), IP, user agent, expiry

---

### TC-AUTH-019 · Session — Revoke Other Sessions
**Priority:** P1
**Steps:** `/settings/sessions` → "Revoke all other sessions"
**Expected:** All other sessions invalidated; current session still active; other browser tabs get 401

---

### TC-AUTH-020 · Sign Out
**Priority:** P0
**Steps:** Click sign out from any authenticated page
**Expected:** Session cookie cleared, redirected to home, `/api/auth/get-session` returns null

---

## 4. Functional Test Cases — Settings

### TC-SET-001 · Profile — Update Display Name
**Priority:** P1
**Steps:** `/settings/profile` → change name → Save
**Expected:** Name updated in `user` table, UI reflects new name, toast success

---

### TC-SET-002 · Profile — Update Avatar URL
**Priority:** P2
**Steps:** Enter valid image URL → Save
**Expected:** Avatar updated; invalid URL (non-http) should show validation error

---

### TC-SET-003 · Profile — Change Email
**Priority:** P1
**Steps:** Enter new email → Save
**Expected:** If RESEND configured: verification email sent to new address, old email still active until verified; DB shows `email` unchanged until verified

---

### TC-SET-004 · Profile — Change Password
**Priority:** P1
**Steps:** Enter current password, new password (8+), confirm → Save
**Expected:** Password updated; old sessions optionally revoked based on `revokeOtherSessions`

---

### TC-SET-005 · Profile — Wrong Current Password
**Priority:** P1
**Steps:** Enter wrong current password when changing
**Expected:** Toast error, password NOT updated in DB

---

### TC-SET-006 · Organization — Create New Org
**Priority:** P1
**Steps:** `/settings/organization` → Create org → enter name
**Expected:** `organization` row created, `member` row created with `role = "admin"`, slug auto-generated from name

---

### TC-SET-007 · Organization — Invite Member
**Priority:** P1
**Steps:** Create org → Invite email with role "member"
**Expected:** `invitation` row created with `status = "pending"`, invite email sent if RESEND configured

---

### TC-SET-008 · Organization — Remove Member
**Priority:** P1
**Steps:** Org admin clicks remove on a member
**Expected:** `member` row deleted; removed user loses org access

---

### TC-SET-009 · Organization — Switch Active Org
**Priority:** P2
**Steps:** User in multiple orgs → setActive to second org
**Expected:** Active org changes; context-scoped data reflects new org

---

### TC-SET-010 · Billing — View Subscription Status
**Priority:** P1
**Steps:** `/settings/billing` as free user
**Expected:** Shows "Free" plan, upgrade CTA visible; as Pro user: shows plan name, renewal date, cancel option

---

### TC-SET-011 · Notifications — Toggle Preferences
**Priority:** P2
**Steps:** `/settings/notifications` → toggle a notification switch
**Expected:** `userPreferences.notificationPrefs` updated in DB, toggle persists on page reload

---

### TC-SET-012 · Account — Delete Account
**Priority:** P0
**Steps:** Settings danger zone → "Delete account" → confirm in AlertDialog
**Expected:** User row soft/hard deleted, all cascaded rows removed (themes, sessions, accounts, auditLog set null), redirected to home, session invalid

---

## 5. Functional Test Cases — Dashboard

### TC-DASH-001 · Dashboard Stats Accuracy
**Priority:** P1
**Steps:** Create 3 themes, generate 5 AI themes, check dashboard
**Expected:** "Themes" card shows 3, "AI Requests (30d)" shows 5

---

### TC-DASH-002 · Dashboard — Recent Activity
**Priority:** P2
**Steps:** Perform actions (sign-in, create theme), check dashboard activity feed
**Expected:** Last 5 audit events shown in relative time format

---

### TC-DASH-003 · Dashboard — Upgrade CTA Visibility
**Priority:** P2
**Steps:** View dashboard as free user vs Pro user
**Expected:** Upgrade CTA card visible for free users only; Pro users see "Pro" badge

---

### TC-DASH-004 · Dashboard — Quick Actions Navigation
**Priority:** P2
**Steps:** Click each quick action card
**Expected:** Each navigates to correct page without 404

---

## 6. Functional Test Cases — Admin Panel

### TC-ADMIN-001 · Admin Access — Non-Admin User
**Priority:** P0
**Steps:** Sign in as non-admin → navigate to `/admin`
**Expected:** Redirected to `/dashboard`, no admin content visible

---

### TC-ADMIN-002 · Admin Access — Unauthenticated
**Priority:** P0
**Steps:** Navigate to `/admin` without session
**Expected:** Redirected to `/` (home)

---

### TC-ADMIN-003 · Admin Users — List All Users
**Priority:** P1
**Steps:** Sign in as admin → `/admin/users`
**Expected:** Table shows all users with name, email, theme count, joined date, status badge

---

### TC-ADMIN-004 · Admin Users — Ban User
**Priority:** P1
**Steps:** Admin clicks "Ban user" on a user row → confirm in dialog
**Expected:**
- `user.banned = true` in DB
- `user.banReason` set to "Banned by admin"
- Audit log row created (`action = "admin.user.banned"`)
- Toast success shown
- Row shows "Banned" badge

---

### TC-ADMIN-005 · Admin Users — Banned User Cannot Sign In
**Priority:** P0
**Precondition:** TC-ADMIN-004 completed
**Steps:** Attempt sign-in as banned user
**Expected:** Sign-in rejected; error indicates account is banned (Better Auth enforces `banned` field)

---

### TC-ADMIN-006 · Admin Users — Unban User
**Priority:** P1
**Steps:** Admin clicks "Unban user" → confirm
**Expected:** `user.banned = false`, `banReason = null`, user can sign in again

---

### TC-ADMIN-007 · Admin Users — Delete User
**Priority:** P0
**Steps:** Admin clicks "Delete permanently" → confirm
**Expected:** User row deleted, cascade removes all child rows (themes, sessions, accounts), toast success, row removed from table

---

### TC-ADMIN-008 · Admin — Community Themes
**Priority:** P2
**Steps:** `/admin/community` → unpublish a theme
**Expected:** `communityTheme` row deleted, tags deleted, `themeLike` rows deleted; theme no longer in community feed

---

### TC-ADMIN-009 · Admin — Audit Log
**Priority:** P2
**Steps:** `/admin/audit` → verify last 100 events
**Expected:** Audit table shows action, user, IP, timestamp; events are in descending order

---

### TC-ADMIN-010 · Admin — Analytics Charts
**Priority:** P2
**Steps:** `/admin/analytics` — inspect 30-day charts
**Expected:** Charts render; days with no activity show 0 (no gaps in 30-day range)

---

## 7. Functional Test Cases — Billing & Subscriptions

### TC-BILL-001 · Checkout — Create Checkout Session
**Priority:** P0
**Steps:** Click "Upgrade to Pro" on pricing or billing page
**Expected:** Redirected to Polar checkout URL; if Polar not configured: clear error (not 500)

---

### TC-BILL-002 · Checkout — Polar Customer Created
**Priority:** P1
**Steps:** Complete checkout in Polar sandbox
**Expected:** `subscription` row created in DB with `status = "active"`, user can access Pro features

---

### TC-BILL-003 · Webhook — subscription.active
**Priority:** P0
**Steps:** Trigger via Polar sandbox or `stripe-cli`-equivalent
**Expected:** `subscription.status = "active"`, confirmation email sent (if RESEND configured), welcome email fires

---

### TC-BILL-004 · Webhook — subscription.canceled
**Priority:** P0
**Steps:** Cancel subscription in Polar sandbox
**Expected:** `subscription.cancelAtPeriodEnd = true` or `status = "canceled"`, cancellation email sent

---

### TC-BILL-005 · Webhook — Signature Verification
**Priority:** P0
**Steps:** POST `/api/webhook/polar` with wrong `webhook-secret` header
**Expected:** HTTP 400 or 403; webhook body NOT processed

---

### TC-BILL-006 · Subscription Gating — AI Generate
**Priority:** P1
**Steps:** As free user, exhaust free AI request quota → attempt another
**Expected:** Error response indicating quota exceeded; Pro user is not limited

---

### TC-BILL-007 · Customer Portal
**Priority:** P2
**Steps:** `/settings/portal` as Pro user
**Expected:** Redirected to Polar customer portal; as free user: redirect or clear message

---

### TC-BILL-008 · Webhook — Unhandled Event Type
**Priority:** P1
**Steps:** POST valid signed webhook with unknown event type
**Expected:** HTTP 200 (must not error — Polar will stop retrying on non-2xx)

---

## 8. Functional Test Cases — Theme Builder

### TC-THEME-001 · Create Theme
**Priority:** P1
**Steps:** `/settings/themes` → generate or manually create theme → save
**Expected:** `theme` row created, appears in list, `aiUsage` row logged if AI used

---

### TC-THEME-002 · Free Tier Limit
**Priority:** P1
**Precondition:** Free user at `MAX_FREE_THEMES` limit
**Steps:** Attempt to create another theme
**Expected:** Error shown, no DB row created

---

### TC-THEME-003 · Update Theme
**Priority:** P1
**Steps:** Edit theme name/styles → save
**Expected:** `theme.updatedAt` updated, styles persisted correctly in JSON column

---

### TC-THEME-004 · Delete Theme
**Priority:** P1
**Steps:** Delete a published theme
**Expected:** `communityTheme` cascade deleted, `theme` deleted, no orphan rows

---

### TC-THEME-005 · Fork Theme
**Priority:** P2
**Steps:** View community theme → fork
**Expected:** New `theme` row created for current user, independent of source (editing doesn't affect original)

---

### TC-THEME-006 · Publish Theme to Community
**Priority:** P2
**Steps:** Select theme → publish → add tags
**Expected:** `communityTheme` row created, tags in `communityThemeTag`, appears in community feed

---

### TC-THEME-007 · Like / Unlike Community Theme
**Priority:** P2
**Steps:** Like a community theme, unlike it
**Expected:** `themeLike` row created/deleted, `communityTheme.likeCount` updated; double-like prevented (composite PK)

---

### TC-THEME-008 · AI Generate Theme — Rate Limit
**Priority:** P1
**Steps:** Make 6 POST `/api/generate-theme` requests within 60 seconds
**Expected:** 5th request succeeds; 6th returns HTTP 429 with `Retry-After` header

---

## 9. Functional Test Cases — REST API v1 & OAuth 2.0

### TC-API-001 · GET /api/v1/me — Valid Bearer Token
**Priority:** P0
**Steps:** Obtain valid token, `GET /api/v1/me` with `Authorization: Bearer <token>`
**Expected:** `200 { data: { id, name, email, image } }`

---

### TC-API-002 · GET /api/v1/me — Missing Token
**Priority:** P0
**Expected:** `401 { error: "Unauthorized" }`

---

### TC-API-003 · GET /api/v1/me — Expired Token
**Priority:** P1
**Steps:** Use token past its `accessTokenExpiresAt`
**Expected:** `401`, not 500

---

### TC-API-004 · GET /api/v1/themes — Scope Check
**Priority:** P1
**Steps:** Use token issued for scope `me:read` only → call `/api/v1/themes`
**Expected:** `403 { error: "Insufficient scope" }` or similar

---

### TC-API-005 · OAuth — Authorization Code Flow (PKCE)
**Priority:** P1
**Steps:**
1. GET `/api/oauth/authorize?client_id=X&code_challenge=Y&...`
2. User approves
3. Exchange code for token at `/api/oauth/token`
4. Call `/api/oauth/userinfo`

**Expected:** Each step returns correct response; code is single-use

---

### TC-API-006 · OAuth — Code Replay Attack
**Priority:** P0
**Steps:** Use authorization code twice in token exchange
**Expected:** First use succeeds; second returns `400 invalid_grant`

---

### TC-API-007 · OAuth — Token Revocation
**Priority:** P1
**Steps:** POST `/api/oauth/revoke` with valid access token
**Expected:** `200`, token marked `revokedAt`; subsequent API calls with token return `401`

---

### TC-API-008 · Health Check
**Priority:** P0
**Steps:** GET `/api/health` — unauthenticated
**Expected:** `200 { status: "ok", db: "ok", latency_ms: <number> }`; if DB down: `{ status: "degraded", db: "error" }`

---

### TC-API-009 · Rate Limiting — v1 API
**Priority:** P1
**Steps:** Send 61 requests to `/api/v1/me` within 60 seconds
**Expected:** First 60 succeed (`200`); 61st returns `429` with `X-RateLimit-Remaining: 0` and `Retry-After` header

---

## 10. Functional Test Cases — GDPR & Data Portability

### TC-GDPR-001 · Data Export — Authenticated
**Priority:** P1
**Steps:** GET `/api/user/export` with valid session
**Expected:**
- HTTP 200
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="launchkit-data-export-YYYY-MM-DD.json"`
- Body contains: `user`, `linkedAccounts`, `sessions`, `themes`, `aiUsage`, `subscriptions`, `auditLog`
- No sensitive fields: no `password`, no `accessToken`, no `refreshToken`

---

### TC-GDPR-002 · Data Export — Unauthenticated
**Priority:** P0
**Steps:** GET `/api/user/export` without session
**Expected:** `401 { error: "Unauthorized" }`, no data returned

---

### TC-GDPR-003 · Data Export — Rate Limited
**Priority:** P2
**Steps:** Send 61 requests within 60 seconds
**Expected:** 61st returns `429`

---

### TC-GDPR-004 · Right to Erasure — Account Deletion
**Priority:** P0
**Steps:** Delete account via `/settings/profile` danger zone
**Expected:**
- `user` row deleted
- `theme`, `session`, `account`, `aiUsage`, `subscription` cascade-deleted
- `auditLog.userId` set to `null` (preserves log, anonymises user)
- Export endpoint returns `401` after deletion

---

### TC-GDPR-005 · Data Completeness Verification
**Priority:** P1
**Steps:** Create themes, generate AI requests, subscribe, then export
**Expected:** Export JSON reflects all created data accurately with correct counts

---

## 11. UAT — User Acceptance Scenarios

### UAT-001 · New Developer Onboarding (Primary Journey)
**As a developer evaluating this starter kit, I want to:**

| Step | Action | Acceptance Criterion |
|---|---|---|
| 1 | Clone repo, run `pnpm install && pnpm dev` | App starts in < 30s, no errors in console |
| 2 | Visit `http://localhost:3000` | Landing page loads with working hero CTA |
| 3 | Click "Get Started", sign up with email | Account created, verification email or direct access |
| 4 | Navigate to `/dashboard` | Stats page loads, no broken UI |
| 5 | Visit all settings pages | All 7 settings pages load without error |
| 6 | Generate a theme with AI | Theme created, preview renders correctly |
| 7 | Visit `/pricing` | Plans displayed, upgrade CTA functional |
| 8 | Sign out | Session cleared, redirected to home |

---

### UAT-002 · Admin User Management
**As an admin, I want to manage users:**

| Step | Action | Acceptance Criterion |
|---|---|---|
| 1 | Sign in as admin, navigate to `/admin/users` | Full user list visible |
| 2 | Ban a test user | Badge changes to "Banned", audit log entry created |
| 3 | Verify banned user cannot log in | Sign-in attempt rejected with clear error |
| 4 | Unban the user | User can log in again |
| 5 | Delete a test user | User removed, cascaded data cleaned |
| 6 | View analytics | 30-day charts render with correct data |

---

### UAT-003 · Billing Lifecycle
**As a paying customer, I want:**

| Step | Action | Acceptance Criterion |
|---|---|---|
| 1 | Upgrade from `/pricing` | Redirected to Polar checkout |
| 2 | Complete checkout (sandbox) | Subscription active, Pro features unlocked |
| 3 | View `/settings/billing` | Shows active plan, renewal date |
| 4 | Cancel subscription | `cancelAtPeriodEnd` true, access until period end |
| 5 | Access customer portal | Polar portal loads for subscription management |

---

### UAT-004 · Two-Factor Authentication
**As a security-conscious user, I want 2FA:**

| Step | Action | Acceptance Criterion |
|---|---|---|
| 1 | Enable 2FA from `/settings/security` | QR code displayed, backup codes shown |
| 2 | Verify QR with authenticator | 2FA confirmed, backup codes downloadable |
| 3 | Sign out and sign in again | 2FA challenge shown after password |
| 4 | Enter correct TOTP | Access granted |
| 5 | Use a backup code | Accepted once, not reusable |
| 6 | Disable 2FA | Login no longer requires TOTP |

---

### UAT-005 · Organization Management
**As an org admin, I want to manage my team:**

| Step | Action | Acceptance Criterion |
|---|---|---|
| 1 | Create organization from `/settings/organization` | Org created with auto-slug |
| 2 | Invite team member by email | Invitation row created, email sent |
| 3 | Member accepts invite | `member` row with correct role |
| 4 | Remove a member | Member loses org access |
| 5 | Switch between orgs | Active org context changes correctly |

---

## 12. Security & Pen Testing

> ⚠️ All tests below MUST be performed only against your own test environment. Never test against production without written authorization.

---

### SEC-001 · Authentication Bypass — Direct URL Access
**Severity:** Critical
**Test:**
```bash
# Without session cookie
curl http://localhost:3000/dashboard
curl http://localhost:3000/settings/profile
curl http://localhost:3000/admin
```
**Expected:** All return redirect (302) to home, NOT page content
**Fail:** Any protected page renders content without a valid session

---

### SEC-002 · Admin Privilege Escalation
**Severity:** Critical
**Test:** Sign in as non-admin user. Directly access:
```bash
curl http://localhost:3000/admin/users
```
**Expected:** Redirected to `/dashboard`
**Test:** Forge admin email in request (not possible via cookie — but verify no `?email=admin@test.com` bypass exists)

---

### SEC-003 · IDOR — Access Another User's Theme
**Severity:** Critical
**Test:**
```bash
# Signed in as user A, get user B's theme ID from community feed
GET /api/v1/themes/<user-B-theme-id>
```
**Expected:** `403` or `404`; user A's token must not return user B's theme data
**Check:** `actions/themes.ts:getTheme()` must filter by `userId`

---

### SEC-004 · IDOR — Export Another User's Data
**Severity:** Critical
**Test:**
```bash
# Try to pass ?userId=<other-user-id> param
GET /api/user/export?userId=<victim-id>
```
**Expected:** Param ignored; only authenticated user's own data returned
**Check:** Route uses `sessionData.user.id` exclusively, never request param

---

### SEC-005 · SQL Injection via API Params
**Severity:** High
**Test payloads:**
```
GET /api/v1/themes/'; DROP TABLE theme; --
GET /api/google-fonts?q=<script>alert(1)</script>
POST /api/generate-theme body: {"prompt": "' OR '1'='1"}
```
**Expected:** Drizzle ORM parameterizes all queries; payloads treated as literal strings, no SQL executed
**Check:** No raw string interpolation in `db.execute(sql\`...\`)` calls

---

### SEC-006 · XSS — Stored via Theme Name
**Severity:** High
**Test:**
1. Create theme with name `<script>alert(document.cookie)</script>`
2. View themes list and dashboard

**Expected:** Name rendered as escaped text; no script execution
**Check:** React auto-escapes; no `dangerouslySetInnerHTML` on user-controlled fields

---

### SEC-007 · CSRF — State-Changing Requests
**Severity:** High
**Test:** From a different origin, attempt to POST to server actions:
```bash
curl -X POST http://localhost:3000/settings/profile \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=hacked"
```
**Expected:** Next.js Server Actions enforce CSRF via origin check; request rejected
**Check:** `next.config` should not have `dangerouslyAllowBrowser: true` pattern

---

### SEC-008 · Webhook Signature Bypass
**Severity:** Critical
**Test:**
```bash
# No signature
curl -X POST http://localhost:3000/api/webhook/polar \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription.active","data":{"userId":"victim"}}'

# Wrong signature
curl -X POST http://localhost:3000/api/webhook/polar \
  -H "webhook-id: fake" \
  -H "webhook-timestamp: 12345" \
  -H "webhook-signature: v1,invalidsig" \
  -d '{}'
```
**Expected:** Both return 400/403; subscription NOT created in DB

---

### SEC-009 · Bearer Token — Other User's Data via API
**Severity:** Critical
**Test:** Use valid token for user A to access user B's resources:
```bash
GET /api/v1/themes/<user-B-theme-id>
Authorization: Bearer <user-A-token>
```
**Expected:** 403/404; user B's theme not returned

---

### SEC-010 · OAuth — PKCE Downgrade Attack
**Severity:** High
**Test:** Start OAuth flow with `code_challenge` but try to exchange code without `code_verifier`
**Expected:** Token exchange rejected; PKCE required when challenge was sent

---

### SEC-011 · OAuth — Redirect URI Manipulation
**Severity:** High
**Test:**
```
GET /api/oauth/authorize?client_id=X&redirect_uri=https://evil.com/callback&...
```
**Expected:** `redirect_uri` validated against registered URIs; request rejected if not matching

---

### SEC-012 · OAuth — Authorization Code Replay
**Severity:** High
**Test:** Intercept and reuse an authorization code
**Expected:** `oauthAuthorizationCode.usedAt` set on first use; second use returns `400 invalid_grant`

---

### SEC-013 · Rate Limiting — Auth Endpoints
**Severity:** High
**Test:** Brute-force sign-in endpoint:
```bash
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/auth/sign-in/email \
    -d '{"email":"target@test.com","password":"guess'$i'"}'
done
```
**Expected:** Better Auth's built-in rate limiting triggers; requests throttled after threshold
**Check:** `rateLimit` table rows accumulate; responses include 429 after limit

---

### SEC-014 · Sensitive Data in Response Headers / Logs
**Severity:** Medium
**Test:** Inspect all API responses for:
- `X-Powered-By` header (should be absent or masked)
- Stack traces in error responses in production
- Session tokens in response bodies

**Expected:** No sensitive internal data exposed in response headers or bodies

---

### SEC-015 · Password Not Stored in Plaintext
**Severity:** Critical
**Test:** After sign-up, query `account` table:
```sql
SELECT password FROM account WHERE provider_id = 'credential' LIMIT 1;
```
**Expected:** Value is a bcrypt/argon2 hash (starts with `$2b$` or `$argon2id$`), never plaintext

---

### SEC-016 · API Key / Secret Exposure Check
**Severity:** Critical
**Test:** Inspect all client-side JS bundles for secrets:
```bash
pnpm build
grep -r "POLAR_ACCESS_TOKEN\|BETTER_AUTH_SECRET\|DATABASE_URL" .next/static/
```
**Expected:** Zero matches — server-only secrets must never appear in client bundles
**Check:** All secrets use `process.env.X` (no `NEXT_PUBLIC_` prefix)

---

### SEC-017 · Account Enumeration via Password Reset
**Severity:** Medium
**Test:** POST to password reset with:
1. Registered email
2. Non-existent email

**Expected:** Both return identical response (200 or generic message); response time should not differ significantly (prevents timing oracle)

---

### SEC-018 · HTTP Security Headers
**Severity:** Medium
**Test:**
```bash
curl -I http://localhost:3000/ | grep -i "content-security-policy\|x-frame-options\|x-content-type-options\|strict-transport-security"
```
**Expected (production):**
- `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HTTPS only)
- `Content-Security-Policy` defined

---

### SEC-019 · GDPR Export — Sensitive Field Exclusion
**Severity:** High
**Test:** Download data export, verify JSON does NOT contain:
- `password` or password hash
- `accessToken` / `refreshToken` from `account` table
- `secret` from `twoFactor` table
- OAuth token hashes from `oauthToken` table

**Expected:** Export only returns safe fields as defined in route (id, email, name, etc.)

---

### SEC-020 · Session Fixation
**Severity:** Medium
**Test:** Note session token before login, attempt to use same token after login
**Expected:** Better Auth issues a new session token on authentication; pre-auth token invalid

---

## 13. Stability & Performance

### PERF-001 · Page Load — Core Web Vitals
**Tool:** Chrome DevTools Lighthouse
**Target pages:** `/` (landing), `/dashboard`, `/settings/profile`, `/pricing`
**Expected:**
- LCP < 2.5s
- CLS < 0.1
- FID / INP < 200ms

---

### PERF-002 · Database — N+1 Query Check
**Test:** Enable Drizzle query logging; load `/admin/users` with 100 users
**Expected:** Single `JOIN` query, not N individual user queries

---

### PERF-003 · API — Health Check Latency
**Test:**
```bash
for i in {1..10}; do curl -w "%{time_total}\n" -s http://localhost:3000/api/health -o /dev/null; done
```
**Expected:** Average < 200ms; no timeouts; DB latency reported in response

---

### PERF-004 · Rate Limiter — Failover to In-Memory
**Test:** Unset `KV_REST_API_URL`, restart dev server, make 5 rapid requests
**Expected:** In-memory rate limiter activates (no crash); 429 still returned after limit

---

### PERF-005 · Concurrent Sign-Ups
**Test:** 10 simultaneous sign-up requests with different emails
**Expected:** All 10 succeed; no DB deadlocks; no duplicate rows

---

### PERF-006 · Webhook — Idempotency
**Test:** Send same Polar webhook event twice (same `webhook-id`)
**Expected:** Second delivery does not create duplicate subscription rows; DB reflects correct state
**Check:** `subscription` table uses `id` from Polar — upsert or check-before-insert pattern

---

### PERF-007 · Large Theme Styles — JSON Storage
**Test:** Create theme with very large `styles` JSON object (> 100KB)
**Expected:** Stored and retrieved correctly; no truncation; response time acceptable

---

### PERF-008 · Audit Log — High Volume
**Test:** Perform 200 actions that write audit logs
**Expected:** GDPR export still returns within `500` limit; admin audit page loads in < 1s; indexes on `createdAt` and `userId` used

---

### PERF-009 · Build Stability
```bash
pnpm lint      # zero warnings or errors
pnpm build     # zero type errors, all 41 routes compile
pnpm e2e       # public tests pass, authenticated skip gracefully without credentials
```

---

## 14. Regression Checklist

Run after every significant change:

**Authentication**
- [ ] Email sign-up creates user + account rows
- [ ] Email sign-in returns session cookie
- [ ] OAuth (Google + GitHub) redirect and callback work
- [ ] Protected routes redirect unauthenticated users
- [ ] Admin routes block non-admin users

**Data Integrity**
- [ ] Deleting user cascades: themes, sessions, accounts, aiUsage
- [ ] `auditLog.userId` set to null (not cascade delete) on user delete
- [ ] Theme delete cascades: communityTheme, themeLike, communityThemeTag
- [ ] `rateLimit` table has `id` PK (never `key` as PK)

**API Contracts**
- [ ] `/api/health` returns `{ status, db, latency_ms }`
- [ ] `/api/v1/me` returns `{ data: { id, name, email, image } }`
- [ ] `/api/user/export` returns attachment JSON
- [ ] `/api/webhook/polar` returns 200 for unhandled event types

**Security**
- [ ] No server secrets in `.next/static/` bundles
- [ ] Webhook signature check active
- [ ] Rate limiting returns 429 with `Retry-After` header
- [ ] IDOR: users can only access their own data

**Build**
- [ ] `pnpm lint` — no warnings
- [ ] `pnpm build` — zero TS errors, all routes included

---

## 15. Known Risk Areas

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Better Auth plugin table missing in DB | High | Critical | Always run `pnpm db:push` after schema changes |
| `BASE_URL` wrong in env → OAuth broken | High | High | Validate `BASE_URL` at startup via `lib/env.ts` |
| Polar webhook secret mismatch | Medium | High | Store secret in env, verify via `POLAR_WEBHOOK_SECRET` |
| `emailAndPassword.enabled` not set → 400 on sign-up | Medium | High | Confirmed fixed in `lib/auth.ts` |
| In-memory rate limiter resets on server restart | Low | Medium | Use Upstash in production; document limitation |
| RESEND not configured → silent email skip | Medium | Low | Acceptable; log warning; no crash |
| Free tier limit bypass via direct DB manipulation | Low | Medium | Limit enforced server-side in actions; not client-controlled |
| Organization plugin: member can act as admin | Low | High | Better Auth enforces roles; validate `requireAdmin()` in all admin actions |
| `auditLog` missing `userAgent` on some inserts | Low | Low | Non-critical; `null` is acceptable for system events |
| OAuth code expiry not enforced client-side | Low | Medium | Server checks `expiresAt` on token exchange |

---

*Generated by Claude Code · LaunchKit SaaS Starter Kit Test Plan v1.0*
