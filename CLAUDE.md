# Claude Project Context — SaaS Kit v2

> Production-ready Next.js 16 SaaS boilerplate. Complete auth layer built-in so developers
> focus on product, not infrastructure.

---

## Test Maintenance Rules — MANDATORY

**Every time you add or change a route, API, or server action, you MUST:**

1. **Add or update an e2e spec** in `e2e/` — map it to a TC-ID in `docs/test-plan.md`
   - New API route → add request test to the relevant `e2e/*.spec.ts`
   - New protected page → add it to `e2e/security.spec.ts` protected pages list
   - New authenticated page → add it to `e2e/dashboard.spec.ts` or `e2e/settings.spec.ts`

2. **Add or update a test case** in `docs/test-plan.md`
   - New feature → add TC-XXXX entry under the relevant section
   - Changed behavior → update the existing TC entry's Expected result
   - Security-relevant change → add or update a SEC-* entry

3. **Run the coverage audit** before finishing:

   ```bash
   pnpm test:coverage-audit:warn
   ```

   Fix any untested routes (or add them to `KNOWN_EXCEPTIONS` with a reason).

4. **Run lint + build** to confirm no regressions:

   ```bash
   pnpm lint && pnpm build
   ```

### Test file ownership

| What changed | Which spec to update |
| --- | --- |
| New `/api/*` route | `e2e/security.spec.ts` + relevant domain spec |
| New protected page | `e2e/security.spec.ts` (SEC-001 list) + `e2e/dashboard.spec.ts` |
| Auth / session change | `e2e/auth.spec.ts` |
| Admin action | `e2e/admin.spec.ts` |
| Billing / webhook | `e2e/billing.spec.ts` |
| GDPR / export | `e2e/gdpr.spec.ts` |
| Settings page | `e2e/settings.spec.ts` |

### Security checklist for new endpoints

- [ ] Returns 401 when unauthenticated → tested in `e2e/security.spec.ts`
- [ ] Scoped to `userId` — no IDOR risk → noted in TC or SEC entry
- [ ] Input validated with Zod `.safeParse()` → never `.parse()`
- [ ] Rate limited if user-facing → tested or noted in plan

---

## UI Quality Checklist — Run Before Finishing Any Component

**Every time you write or edit a component, verify all of these before stopping.**

### Mobile layout
- [ ] Page padding is `p-4 md:p-6` or `p-4 md:p-8` — never flat `p-8` alone
- [ ] Page headings scale: `text-2xl md:text-3xl` — never flat `text-3xl` alone
- [ ] Flex rows that could overflow use `flex-col sm:flex-row` — never flat `flex-row`
- [ ] Every flex container with text children has `min-w-0` and text has `truncate`
- [ ] Every action button beside text has `shrink-0` — never let it compress
- [ ] Grid columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — never start at 2+ cols
- [ ] Multi-column dashboard layouts use `lg:col-span-X` not `md:col-span-X` — tablet gets full width
- [ ] Tables wrapped in `overflow-x-auto` container, non-essential columns have `hidden sm:table-cell`

### Sheet / modal (hamburger menu, drawers)
- [ ] Sheet width is `w-[min(320px,85vw)]` not a fixed `w-72` — adapts to any phone size
- [ ] SheetContent with custom layout uses `p-0` then explicit padding per zone
- [ ] Guest sheet has welcome text + feature list — never just raw buttons floating alone
- [ ] Auth sheet nav links have `h-11` touch targets (44px minimum)
- [ ] Sign Out is pinned to bottom with `mt-auto` — not crammed after nav links

### Buttons and interactive elements
- [ ] Touch targets are minimum `h-11` on mobile (44px) — use `h-11 md:h-9` if needed
- [ ] Button groups stack on mobile: `flex flex-col sm:flex-row gap-3`
- [ ] Full-width buttons on mobile: `w-full sm:w-auto`
- [ ] Loading state always: disabled + spinner (`Loader2 animate-spin`) + text change

### Color and theming
- [ ] Zero hardcoded colors (`zinc-900`, `gray-200`, `white`, `black`) — use semantic tokens only
- [ ] Semantic tokens: `bg-background`, `bg-card`, `bg-muted`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-destructive`
- [ ] Dark mode works — never assume light background

### Spacing and structure
- [ ] `space-y-4 md:space-y-6` for page-level vertical rhythm — not flat `space-y-6`
- [ ] Cards use standard structure: `CardHeader` → `CardContent` → `CardFooter` (optional)
- [ ] Danger zone card always last, always `border-destructive/50`
- [ ] Empty states: icon + title + description + CTA — never a plain text paragraph

### Code patterns
- [ ] No `window.confirm()` — use `AlertDialog` for all destructive confirmations
- [ ] Toasts via `sonner` — `toast.success()`, `toast.error()` — never `alert()`
- [ ] `cn()` for all conditional classes — never string concatenation
- [ ] Icons from `lucide-react` only — never install a second icon library

---

## Quick Reference — Common Mistakes

Scan this first. These are the most frequently hallucinated or forgotten patterns.

1. **Never** `authClient.forgetPassword()` — use `authClient.requestPasswordReset()`
2. **Webhook routes**: `req.text()` not `req.json()` — parsing destroys Stripe signature
3. **databaseHooks**: never `await` — always fire-and-forget with `.catch(console.error)`
4. **rateLimit table** needs `id` PK in addition to `key` — using `key` as PK crashes Better Auth
5. **Stripe `current_period_end`** is Unix seconds — multiply by 1000 for JS `Date`
6. **API keys**: hash with SHA-256, never store raw — show raw key once on creation only
7. **Never `db:push` in production** — use `db:generate` + `db:migrate`
8. **Multi-tenant queries**: always filter by `organizationId` — never fetch all rows
9. **Neon**: use HTTP driver (`neon-http`) not TCP for serverless/Vercel
10. **shadcn**: `pnpm dlx shadcn@latest add`, never `npx`, never hardcode colors
11. **PostHog server-side**: always call `await ph.shutdown()` before function exits
12. **File uploads**: PUT directly to R2 signed URL — never proxy files through Next.js
13. **Zod in API routes**: `.safeParse()` not `.parse()` — never throw unhandled Zod errors
14. **Stripe webhooks**: always return 200 for unhandled events — or Stripe retries forever
15. **proxy.ts** is Next.js 16 middleware — do not also have `middleware.ts`, they conflict

---

## Detailed Reference Docs

Read these on demand — only when working on that area:

| Topic | File |
| --- | --- |
| Stripe billing, metering, dunning | `docs/billing.md` |
| File upload (R2), email templates, deliverability | `docs/storage-email.md` |
| Background jobs, analytics, error tracking, logging | `docs/observability.md` |
| Vitest, Playwright, test patterns | `docs/testing.md` |
| Security headers, Zod, Redis, SSO, API keys, webhooks | `docs/security.md` |
| DB production, feature flags, health checks, admin panel | `docs/infrastructure.md` |
| Audit log UI, GDPR, onboarding, notifications, i18n, support | `docs/enterprise.md` |

---

## 1. Project Overview

**Stack:** Next.js 16 · Better Auth · Drizzle ORM · Neon PostgreSQL · Resend · shadcn/ui v4 · Tailwind CSS v4

### Key file map

| File | Purpose |
| --- | --- |
| `lib/auth.ts` | Better Auth server config — plugins, email, rate limits, DB hooks |
| `lib/auth-client.ts` | Better Auth client — React hooks, plugin clients |
| `lib/db/schema.ts` | All Drizzle table definitions |
| `lib/app-config.ts` | App name / description / TOTP issuer — edit to rebrand |
| `lib/api-middleware.ts` | `withOrganizationRole()` — RBAC wrapper for custom API routes |
| `proxy.ts` | Route protection (Next.js 16 middleware equivalent) |
| `components/ui/` | shadcn components |
| `app/(auth)/` | Sign-in, sign-up, reset, verify, 2FA pages |
| `app/dashboard/` | Protected dashboard pages + layout |

### Active Better Auth plugins

- Server `lib/auth.ts`: `nextCookies`, `organization`, `twoFactor`, `magicLink`, `emailOTP`, `phoneNumber`
- Client `lib/auth-client.ts`: `organizationClient`, `twoFactorClient`, `magicLinkClient`, `emailOTPClient`, `phoneNumberClient`

---

## 2. Development Setup

### Package manager

**pnpm only.** Never use npm or yarn.

### Environment variables

All secrets live in `.env` (gitignored). `.env.example` is the template.
GitHub Actions uses `GH_CLIENT_ID` / `GH_CLIENT_SECRET` (not `GITHUB_*` — reserved by Actions).

### Database commands

```bash
pnpm run db:push       # apply schema changes locally (no migration files)
pnpm run db:generate   # generate migration files (production)
pnpm run db:migrate    # run migration files (production)
pnpm run db:studio     # visual data browser
```

### CI/CD

- `.github/workflows/ci.yml` — type-check + lint + build on every push
- `.github/workflows/deploy.yml` — Vercel preview (PRs) + production (main)
- `vercel.json` has `"git": { "deploymentEnabled": false }` — all deploys go through GitHub Actions

---

## 3. shadcn/ui

**Always fetch shadcn docs before adding or composing components:**

- Full LLM context: <https://ui.shadcn.com/llms.txt>
- Component docs: <https://ui.shadcn.com/docs/components/[component-name]>

Use the **`shadcn` MCP skill** to look up components, get usage examples, and add new ones.

### Installed components (do not re-add)

`button`, `input`, `label`, `card`, `alert-dialog`, `dropdown-menu`, `sheet`, `separator`,
`sonner`, `avatar`, `tooltip`, `scroll-area`, `badge`, `select`, `textarea`,
`input-otp`, `combobox`, `field`, `input-group`, `direction`

Not installed — add before using: `tabs`, `sidebar`, `progress`, `table`, `dialog`, `popover`, `calendar`

### Adding components

```bash
pnpm dlx shadcn@latest add <component-name>
pnpm dlx shadcn@latest add tabs progress table dialog
```

Do NOT use `npx shadcn-ui@latest` (old CLI) or `npx shadcn@latest` — always `pnpm dlx`.

### Tailwind v4 differences from v3

- No `tailwind.config.ts` — config lives in `app/globals.css` via `@theme inline {}`
- CSS variables use `oklch()` color format, not HSL
- `cn()` is in `lib/utils.ts` (clsx + tailwind-merge)

### Core patterns

```typescript
// Imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Conditional classes — always cn(), never string concatenation
<div className={cn("base", isActive && "active", variant === "ghost" && "ghost")} />

// Toasts — always sonner, never shadcn toast
import { toast } from "sonner"
toast.success("Saved!")
toast.error("Something went wrong")
toast.promise(asyncFn(), { loading: "Saving...", success: "Saved!", error: "Failed" })
```

### Theming — never hardcode colors

```typescript
// WRONG — breaks dark mode
<div className="bg-zinc-900 text-white border-gray-200" />

// CORRECT — semantic tokens work in light + dark
<div className="bg-background text-foreground" />
<div className="bg-card text-card-foreground border-border" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="text-destructive" />
```

### Responsive — mobile-first

```typescript
<div className="flex flex-col md:flex-row gap-4" />
<div className="hidden md:block" />          // desktop only
<div className="block md:hidden" />          // mobile only
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
```

### Form pattern (no react-hook-form unless explicitly needed)

```typescript
const [value, setValue] = React.useState("")
const [loading, setLoading] = React.useState(false)

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
        const { error } = await authClient.updateUser({ name: value })
        if (error) toast.error(error.message)
        else toast.success("Saved!")
    } finally { setLoading(false) }
}

<Button type="submit" disabled={loading}>
    {loading ? "Saving..." : "Save changes"}
</Button>
```

### DropdownMenu — correct named exports (commonly hallucinated)

```typescript
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
```

### AlertDialog — destructive action confirmation

```typescript
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
    AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"

// AlertDialogAction is primary by default — add destructive styles manually
<AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
    Delete
</AlertDialogAction>
```

### Sheet — mobile drawers / slide-over panels

```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// side: "left" | "right" | "top" | "bottom" (default "right")
// Always include SheetTitle for accessibility (use sr-only if visually hidden)
```

### Icons — always lucide-react (already installed)

```typescript
import { Settings, Users, Shield, Bell, LogOut, Plus, Loader2, ChevronRight } from "lucide-react"
// Spinner: <Loader2 className="h-4 w-4 animate-spin" />
// Size conventions: h-4 w-4 (inline), h-5 w-5 (standalone), h-6 w-6 (section header)
// Never install a separate icon library
```

### Dashboard page layout — standard pattern

```typescript
// Every dashboard page follows this structure
export default function MyPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
                    <p className="text-muted-foreground text-sm mt-1">Description of what this page does</p>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            </div>

            {/* Content in cards */}
            <Card>
                <CardHeader>
                    <CardTitle>Section</CardTitle>
                    <CardDescription>What this section contains</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* content */}
                </CardContent>
            </Card>
        </div>
    )
}
```

### Loading state — skeleton pattern

```typescript
// Always show skeletons, never a spinner alone for page-level loading
import { Skeleton } from "@/components/ui/skeleton"  // add if not installed

// Page skeleton matches the real layout shape
function PageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        </div>
    )
}

// Button loading state — always disable + show spinner
<Button disabled={loading}>
    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
    {loading ? "Saving..." : "Save changes"}
</Button>
```

### Empty state pattern

```typescript
// Use when a list/table has no data yet
function EmptyState({ title, description, action }: {
    title: string; description: string; action?: React.ReactNode
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 bg-muted rounded-full mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">{description}</p>
            {action}
        </div>
    )
}

// Usage:
<EmptyState
    title="No members yet"
    description="Invite your team to get started."
    action={<Button><Plus className="h-4 w-4 mr-2" />Invite member</Button>}
/>
```

### Data list pattern (without a full table library)

```typescript
// Prefer this over a table for simple lists — easier to make responsive
<div className="divide-y">
    {items.map(item => (
        <div key={item.id} className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{item.email}</p>
                </div>
            </div>
            <Badge variant="secondary">{item.role}</Badge>
        </div>
    ))}
</div>
```

### Badge variants

```typescript
import { Badge } from "@/components/ui/badge"
<Badge>default</Badge>                      // primary color
<Badge variant="secondary">secondary</Badge> // muted
<Badge variant="outline">outline</Badge>     // border only
<Badge variant="destructive">error</Badge>   // red

// Status badges — semantic color via className
<Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
<Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
```

### Dashboard sidebar nav — already built at components/dashboard/sidebar.tsx

```typescript
// Nav item structure used by DashboardSidebar
const navItems = [
    { title: "Overview",      href: "/dashboard",              icon: LayoutDashboard },
    { title: "Organization",  href: "/dashboard/organization", icon: Users },
    { title: "Settings",      href: "/dashboard/settings",     icon: Settings },
    { title: "Security",      href: "/dashboard/settings/security", icon: Shield },
]
// Active detection: pathname === item.href (exact match)
// Desktop: hidden md:flex fixed left sidebar w-56
// Mobile:  md:hidden horizontal scrollable tab bar sticky top-14
```

### Data table with sorting (when list pattern isn't enough)

```bash
pnpm dlx shadcn@latest add table   # add first
```

```typescript
// Simple sortable table — no external library needed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<div className="rounded-md border overflow-x-auto">   {/* overflow-x-auto for mobile */}
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="min-w-[140px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>  {/* hide on mobile */}
                <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {rows.map(row => (
                <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{row.role}</Badge>
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>...</DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</div>
// Rule: hide non-essential columns on mobile with hidden sm:table-cell
// Rule: always wrap table in overflow-x-auto container
```

### Multi-step form / wizard pattern

```typescript
// State machine — no library needed for simple flows
const STEPS = ["details", "plan", "confirm"] as const
type Step = typeof STEPS[number]

const [step, setStep] = React.useState<Step>("details")
const [data, setData] = React.useState<Partial<FormData>>({})

const next = (values: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...values }))
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
}
const back = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
}

// Progress indicator
<div className="flex gap-2 mb-8">
    {STEPS.map((s, i) => (
        <div key={s} className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            STEPS.indexOf(step) >= i ? "bg-primary" : "bg-muted"
        )} />
    ))}
</div>
```

### Confirmation dialog — always use AlertDialog, not window.confirm

```typescript
// For destructive actions: delete account, remove member, cancel subscription
const [open, setOpen] = React.useState(false)

<AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. Your account and all data will be permanently deleted.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
            >
                Delete account
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

### Settings page layout — two-column on desktop, stacked on mobile

```typescript
// Standard pattern for settings pages (profile, security, billing)
<div className="p-6 space-y-6 max-w-4xl">
    <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
    </div>

    {/* Each settings section */}
    <Card>
        <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Update your name and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* form fields */}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>Save changes</Button>
        </CardFooter>
    </Card>

    {/* Danger zone — always last, visually separated */}
    <Card className="border-destructive/50">
        <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="font-medium text-sm">Delete account</p>
                    <p className="text-muted-foreground text-xs">Permanently remove your account</p>
                </div>
                <Button variant="destructive" className="shrink-0">Delete account</Button>
            </div>
        </CardContent>
    </Card>
</div>
```

---

### Mobile responsiveness — rules and patterns

**Breakpoints** (Tailwind default, unchanged in v4):

```
sm:  640px   — large phones landscape / small tablets
md:  768px   — tablets / this is the main desktop breakpoint used in this project
lg:  1024px  — laptops
xl:  1280px  — desktops
```

**Core rules:**

```typescript
// 1. Always design mobile-first — base classes are mobile, md: overrides for desktop
<div className="flex flex-col md:flex-row gap-4" />

// 2. Dashboard layout — sidebar is hidden on mobile, replaced by horizontal tab bar
// Already handled in components/dashboard/sidebar.tsx — do not duplicate

// 3. Page padding — tighter on mobile
<div className="p-4 md:p-6 space-y-4 md:space-y-6" />

// 4. Typography scaling
<h1 className="text-xl md:text-2xl font-bold tracking-tight" />
<p className="text-sm md:text-base text-muted-foreground" />

// 5. Button groups — stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-3">
    <Button className="w-full sm:w-auto">Primary</Button>
    <Button variant="outline" className="w-full sm:w-auto">Secondary</Button>
</div>

// 6. Cards in a grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" />

// 7. Hide secondary info on mobile — always use table-cell not block for table columns
<TableCell className="hidden sm:table-cell">Secondary info</TableCell>
<span className="hidden md:inline">Details only on desktop</span>

// 8. Touch targets — minimum 44px height on interactive elements
<Button className="h-11 md:h-9" />   // taller on mobile, normal on desktop

// 9. Truncate long text — always min-w-0 on flex children with truncate
<div className="flex items-center gap-3 min-w-0">
    <span className="truncate">{longText}</span>
</div>

// 10. Modals — full-width on mobile
// AlertDialog and Sheet handle this automatically via shadcn defaults
// For custom dialogs: w-full max-w-sm mx-auto
```

### Date picker — calendar + popover pattern

```bash
pnpm dlx shadcn@latest add calendar popover   # add both first
pnpm add date-fns                             # date formatting
```

```typescript
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function DatePicker({ value, onChange }: { value?: Date; onChange: (d: Date) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : "Pick a date"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(d) => d && onChange(d)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

// Date range — same pattern, mode="range"
const [range, setRange] = useState<{ from?: Date; to?: Date }>({})
// <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />

// Always save as ISO string to DB, never a Date object
await db.update(table).set({ dueDate: value.toISOString() })
```

### Drag and drop — dnd-kit (preferred, no jQuery)

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

```typescript
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

// Sortable item component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id })
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn("flex items-center gap-2 p-3 bg-card border rounded-md",
                isDragging && "opacity-50 shadow-lg")}
        >
            <GripVertical
                className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
                {...attributes} {...listeners}
            />
            {children}
        </div>
    )
}

// Parent list
function SortableList({ initialItems }: { initialItems: string[] }) {
    const [items, setItems] = useState(initialItems)
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    function handleDragEnd({ active, over }: DragEndEvent) {
        if (over && active.id !== over.id) {
            setItems(prev => {
                const oldIndex = prev.indexOf(active.id as string)
                const newIndex = prev.indexOf(over.id as string)
                return arrayMove(prev, oldIndex, newIndex)
            })
            // Persist new order to DB here — fire-and-forget
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {items.map(id => <SortableItem key={id} id={id}>{id}</SortableItem>)}
                </div>
            </SortableContext>
        </DndContext>
    )
}
// Rules:
// — Add an `order` integer column to the DB table for persistence
// — Always use arrayMove from @dnd-kit/sortable, never splice manually
// — Persist order after drag ends (fire-and-forget, not awaited)
```

---

**What's already mobile-ready in this project:**

- `MainNav` — avatar dropdown on desktop, Sheet drawer on mobile
- `DashboardSidebar` — sidebar on desktop, horizontal tab bar on mobile
- `AuthLayout` — left panel hidden on mobile (`hidden lg:flex`), right panel full-width
- `LandingPage` — stacked CTA buttons on mobile, side-by-side on desktop

**What you must handle yourself when building new pages:**

- Table columns (hide non-essential ones on mobile)
- Form button rows (stack on mobile)
- Page padding (`p-4 md:p-6`)
- Card grids (1 col mobile → 2–3 col desktop)

---

## 4. Better Auth

**Always fetch live docs before any auth change:**

- Full LLM context: <https://better-auth.com/llms.txt>
- Email/password: <https://better-auth.com/docs/authentication/email-password>
- Email OTP: <https://better-auth.com/docs/plugins/email-otp>
- Organization: <https://better-auth.com/docs/plugins/organization>
- Two-factor: <https://better-auth.com/docs/plugins/2fa>
- Magic link: <https://better-auth.com/docs/plugins/magic-link>
- Next.js: <https://better-auth.com/docs/integrations/next-js>

### Client API — verified method names

```typescript
// Sign in / sign up
signIn.email({ email, password })
signIn.social({ provider, callbackURL })
signIn.emailOtp({ email, otp })
signIn.magicLink({ email, callbackURL })
signUp.email({ name, email, password })

// Password reset — link-based
authClient.requestPasswordReset({ email, redirectTo })  // CORRECT
authClient.forgetPassword(...)                          // WRONG — overridden by emailOTPClient
authClient.resetPassword({ newPassword, token })

// Email OTP reset (different flow)
authClient.emailOtp.sendVerificationOtp({ email, type: "forget-password" })

// Two-factor
authClient.twoFactor.enable({ password })           // returns { totpURI, backupCodes }
authClient.twoFactor.disable({ password })
authClient.twoFactor.verifyTotp({ code, trustDevice })
authClient.twoFactor.sendOtp()                      // OTP fallback via SMS/email
authClient.twoFactor.verifyOtp({ code, trustDevice })
authClient.twoFactor.verifyBackupCode({ code })

// Session management
authClient.listSessions()
authClient.revokeSession({ token })
authClient.revokeOtherSessions()

// User / account
authClient.updateUser({ name })
authClient.changeEmail({ newEmail, callbackURL })
authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
authClient.deleteUser({ callbackURL })
authClient.sendVerificationEmail({ email, callbackURL })

// Organization
organization.create({ name, slug })
organization.setActive({ organizationId })
organization.inviteMember({ email, role })
organization.removeMember({ memberIdOrEmail })
```

### Server endpoint paths

```
POST /api/auth/sign-in/email
POST /api/auth/sign-up/email
POST /api/auth/request-password-reset
POST /api/auth/reset-password
GET  /api/auth/verify-email?token=
POST /api/auth/email-otp/send-verification-otp
POST /api/auth/sign-in/email-otp
```

### Critical plugin conflicts

**emailOTPClient** overrides `authClient.forgetPassword` into a namespace object `{ emailOtp: Function }`.
Always use `authClient.requestPasswordReset()` for link-based reset — never `forgetPassword()`.

**phoneNumber plugin import** conflicts with the `phoneNumber` field name:

```typescript
import { phoneNumber as phoneNumberPlugin } from "better-auth/plugins"
```

**phoneNumber vs emailOTP** — `phoneNumber` plugin = phone+password auth + profile verification.
For OTP sign-in (phone or email), use `emailOTP`. Route via `email.includes("@")` to distinguish.

### Email verification config

```typescript
emailVerification: {
    callbackURL: "/dashboard",
    autoSignInAfterVerification: true,
}
```

### Route protection — proxy.ts (Next.js 16)

Next.js 16 uses `proxy.ts` instead of `middleware.ts`. Both cannot coexist.
The matcher must explicitly list every path that needs protection.

### Drizzle schema — rateLimit (runtime-confirmed fix)

Better Auth adapter requires `id` as PK on **every** model. Using `key` as PK causes:
`[BetterAuthError]: The field "id" does not exist in the "rateLimit" Drizzle schema`

```typescript
export const rateLimit = pgTable("rate_limit", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: text("key").unique(),
    count: integer("count").notNull(),
    lastRequest: bigint("last_request", { mode: "number" }).notNull(),
})
```

### databaseHooks — always fire-and-forget

```typescript
// CORRECT — DB hiccup cannot block auth operation
db.insert(auditLog).values({ ... }).catch(console.error)

// WRONG — blocks auth if DB is slow
await db.insert(auditLog).values({ ... })
```
