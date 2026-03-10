#!/usr/bin/env tsx
// scripts/check-test-coverage.ts
//
// Audits e2e test coverage by scanning all API routes and page routes,
// then checking whether each appears in at least one e2e spec file.
//
// Run:   pnpm test:coverage-audit        (exits 1 on gaps)
//        pnpm test:coverage-audit:warn   (exits 0, warnings only)
//
// Add routes to KNOWN_EXCEPTIONS below when intentionally skipping coverage.

import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const E2E_DIR = path.join(ROOT, "e2e");
const WARN_ONLY = process.argv.includes("--warn");

// ── Helpers ────────────────────────────────────────────────────────────────

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        walk(full);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

/** Read all e2e spec files and return one big string for grep-style checks */
function readAllSpecs(): string {
  const specs = findFiles(E2E_DIR, /\.spec\.ts$/);
  return specs.map((f) => fs.readFileSync(f, "utf-8")).join("\n");
}

/** Convert file path to a route string for display */
function toRoute(filePath: string): string {
  // Normalise to forward slashes first (Windows compat), then strip prefixes
  const normalised = filePath.replace(/\\/g, "/");
  const appRoot = path.join(ROOT, "app").replace(/\\/g, "/");
  return normalised
    .replace(appRoot, "")
    .replace(/\/route\.ts$/, "")
    .replace(/\/page\.tsx$/, "");
}

// ── Known exceptions: routes intentionally not covered by e2e tests ────────
// Add entries here when a route is tested via unit/integration tests instead,
// or is a redirect/metadata-only route with no testable UI.

const KNOWN_EXCEPTIONS = new Set([
  "/icon.svg",
  "/sitemap.xml",
  "/r/themes/[id]",         // public registry JSON — no browser UI to test
  "/r/v0/[id]",             // public registry JSON — no browser UI to test
  "/api/auth/[...all]",     // Better Auth handler — auth.spec.ts covers auth flows
  "/api/google-fonts",      // utility passthrough — no auth, no state
  "/api/oauth/authorize",   // OAuth server — requires registered OAuth app client
  "/api/oauth/revoke",      // OAuth server — requires valid token; unit-tested
  "/api/v1/themes/[themeId]", // parameterised — base /api/v1/themes covered
  "/settings",              // redirect-only (-> /settings/profile)
  "/settings/portal",       // redirect to Polar external URL
  "/success",               // post-checkout static page
  "/oauth/authorize",       // OAuth consent UI — requires registered client
  "",                       // root landing page covered by public.spec.ts as "/"
  "/terms",                 // static content page — covered by public.spec.ts pattern
]);

// ── Patterns that count as "covered" in the spec files ────────────────────
// A route is covered if its path appears in ANY spec file.

function isCovered(route: string, allSpecs: string): boolean {
  // Normalize dynamic segments: [id] -> covered if spec mentions the base path
  const base = route.replace(/\[.*?\]/g, "");
  const patterns = [
    route,                              // exact match
    base,                               // base without dynamic segment
    route.replace("/api/", "/api/"),    // api routes
  ];
  return patterns.some((p) => p.length > 1 && allSpecs.includes(p));
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const allSpecs = readAllSpecs();
  const specFiles = findFiles(E2E_DIR, /\.spec\.ts$/).map((f) =>
    path.relative(ROOT, f).replace(/\\/g, "/")
  );

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║        LaunchKit — E2E Test Coverage Audit           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  console.log(`Spec files found: ${specFiles.length}`);
  specFiles.forEach((f) => console.log(`  ✓ ${f}`));
  console.log();

  const gaps: { category: string; route: string }[] = [];

  // ── 1. API routes ────────────────────────────────────────────────────────
  const apiRoutes = findFiles(path.join(ROOT, "app", "api"), /route\.ts$/);
  console.log(`\n── API Routes (${apiRoutes.length} found) ─────────────────────────`);

  for (const file of apiRoutes) {
    const route = toRoute(file);
    const covered = isCovered(route, allSpecs);
    const excepted = KNOWN_EXCEPTIONS.has(route);
    const status = excepted ? "⊘ skip" : covered ? "✓" : "✗ MISSING";
    if (!covered && !excepted) gaps.push({ category: "API", route });
    console.log(`  ${status.padEnd(10)} ${route}`);
  }

  // ── 2. Page routes ───────────────────────────────────────────────────────
  const pageFiles = findFiles(path.join(ROOT, "app"), /page\.tsx$/).filter(
    (f) => !f.includes("node_modules") && !f.includes("(auth)")
  );
  console.log(`\n── Page Routes (${pageFiles.length} found) ─────────────────────────`);

  for (const file of pageFiles) {
    const route = toRoute(file);
    const covered = isCovered(route, allSpecs);
    const excepted = KNOWN_EXCEPTIONS.has(route);
    const status = excepted ? "⊘ skip" : covered ? "✓" : "✗ MISSING";
    if (!covered && !excepted) gaps.push({ category: "Page", route });
    console.log(`  ${status.padEnd(10)} ${route}`);
  }

  // ── 3. Summary ───────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  const total = apiRoutes.length + pageFiles.length;
  const covered = total - gaps.length - KNOWN_EXCEPTIONS.size;
  const pct = Math.round((covered / total) * 100);

  console.log(`\nCoverage: ${covered}/${total} routes (${pct}%)`);
  console.log(`Skipped (known exceptions): ${KNOWN_EXCEPTIONS.size}`);

  if (gaps.length === 0) {
    console.log("\n✅ All routes have e2e test coverage.\n");
    process.exit(0);
  }

  console.log(`\n⚠️  ${gaps.length} route(s) missing e2e coverage:\n`);
  for (const { category, route } of gaps) {
    console.log(`  [${category}] ${route}`);
    console.log(`         -> Add a test in e2e/ and reference it in docs/test-plan.md`);
  }

  console.log(`
To suppress a route:
  Add it to KNOWN_EXCEPTIONS in scripts/check-test-coverage.ts
  with a comment explaining why it's intentionally excluded.

To add a test:
  Create or update a spec in e2e/ and update docs/test-plan.md.
`);

  if (WARN_ONLY) {
    console.log("(--warn mode: exiting 0 despite gaps)\n");
    process.exit(0);
  }

  process.exit(1);
}

main();
