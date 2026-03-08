# Automated Testing — Vitest + Playwright

## 11. Automated Testing

**Install:** `pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event`
**E2E:** `pnpm add -D @playwright/test`

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
    plugins: [react()],
    test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"] },
    resolve: { alias: { "@": path.resolve(__dirname, ".") } },
})
```

### Mocking Better Auth in tests

```typescript
// tests/setup.ts
vi.mock("@/lib/auth-client", () => ({
    useSession: () => ({
        data: { user: { id: "test-id", email: "test@test.com", name: "Test" } },
        isPending: false,
    }),
    signOut: vi.fn(),
    authClient: { updateUser: vi.fn(), changePassword: vi.fn() },
}))
```

Test files: `*.test.ts` or `*.test.tsx` placed alongside the file being tested.

### Playwright — reuse auth state across tests

```typescript
// tests/auth.setup.ts
import { test as setup } from "@playwright/test"
setup("authenticate", async ({ page }) => {
    await page.goto("/sign-in")
    await page.fill("[name=email]", process.env.TEST_USER_EMAIL!)
    await page.fill("[name=password]", process.env.TEST_USER_PASSWORD!)
    await page.click("[type=submit]")
    await page.waitForURL("/dashboard")
    await page.context().storageState({ path: "tests/.auth/user.json" })
})
```

### playwright.config.ts — use saved auth state

```typescript
import { defineConfig } from "@playwright/test"
export default defineConfig({
    projects: [
        { name: "setup", testMatch: "**/auth.setup.ts" },
        {
            name: "authenticated",
            use: { storageState: "tests/.auth/user.json" },
            dependencies: ["setup"],
        },
    ],
})
```

### pnpm scripts to add

```json
"test":     "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```
