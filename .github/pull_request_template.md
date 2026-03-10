## Summary
<!-- What does this PR do? Why is it needed? Link to issue if applicable. -->

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature
- [ ] Breaking change (requires migration/doc update)
- [ ] Refactor / chore
- [ ] Documentation only

---

## Test Coverage Checklist
<!-- Every PR must answer these. Check all that apply or mark N/A. -->

### Automated Tests
- [ ] New Playwright spec added OR existing spec updated to cover this change
- [ ] `pnpm lint` passes locally
- [ ] `pnpm build` passes locally (zero type errors)
- [ ] `pnpm e2e` passes locally (or skips gracefully without credentials)

### Test Plan — docs/test-plan.md
- [ ] New test cases added to `docs/test-plan.md` for new features/routes
- [ ] Existing test cases updated if behavior changed
- [ ] Security implications reviewed (see SEC-* cases)

### Mapping to Test Cases
<!--
List the TC-IDs from docs/test-plan.md that cover this change.
If no existing TC covers it, you MUST add one before merging.

Example:
  - TC-AUTH-001 (email sign-up) — verified via e2e/auth.spec.ts
  - TC-SET-003 (email change) — covered by e2e/settings.spec.ts
  - SEC-003 (IDOR) — new endpoint: e2e/security.spec.ts updated
-->

Covered by: <!-- TC-XXX-YYY, TC-XXX-ZZZ -->

---

## New Routes / APIs Added
<!-- Fill out if you added new pages, API routes, or server actions. -->

| Route / Action | Auth Required? | Spec file | TC-ID |
|---|---|---|---|
| `GET /api/...` | Yes/No | `e2e/?.spec.ts` | TC-XXX-YYY |

---

## Database Changes
- [ ] Schema changes made → `pnpm db:generate` run → migration file committed
- [ ] `pnpm db:push` confirmed on test DB
- [ ] Cascade deletes verified (no orphan rows)
- [ ] No raw SQL string interpolation (injection safe)

---

## Security Review
<!-- For any change touching auth, API, or data handling -->
- [ ] New endpoints return 401/403 for unauthenticated/unauthorized requests
- [ ] User-scoped data filtered by `userId` (no IDOR risk)
- [ ] No secrets added to client-side code (`NEXT_PUBLIC_` prefix not used for secrets)
- [ ] Input validated with Zod `.safeParse()` (not `.parse()`)
- [ ] Webhook endpoints verify signatures before processing

---

## Screenshots / Demo
<!-- For UI changes: before/after screenshots or a short Loom. -->

---

## Deploy Notes
<!-- Anything ops/infra needs to know: new env vars, migration steps, feature flags. -->

New env vars required:
- [ ] None
- [ ] `VAR_NAME` — description, where to get the value
