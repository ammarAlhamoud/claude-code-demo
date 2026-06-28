# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint (eslint-config-next)
npx tsc --noEmit   # typecheck (no dedicated script)

npx prisma generate          # regenerate the client into generated/prisma (run after schema edits)
npx prisma migrate dev       # create/apply a migration against the SQLite db
npx prisma db seed           # reset + seed sample data (runs `tsx prisma/seed.ts`)
```

There is no test runner configured. Verification is done via `tsc --noEmit`, `npm run lint`, and exercising the running app / API routes.

## Stack & hard constraints

- **Next.js 16** (App Router, Turbopack), **React 19**, **Tailwind v4**, **Recharts 3**.
- **Prisma 7** — this is a major version with breaking changes from older Prisma. Do not assume pre-7 conventions:
  - The schema datasource has **no `url`**; the connection string lives in `prisma.config.ts` (`datasource.url = env("DATABASE_URL")`), loaded from `.env` (`DATABASE_URL="file:./prisma/dev.db"`, gitignored).
- Prisma 7 requires a **driver adapter** — there is no Rust engine. We use `@prisma/adapter-better-sqlite3`. Any `new PrismaClient()` must pass `{ adapter }` (see `lib/db.ts` and `prisma/seed.ts`).
  - The generated client is output to **`generated/prisma`** (not `@prisma/client`); import it as `@/generated/prisma`.
  - The seed command is declared in `prisma.config.ts` (`migrations.seed`), not in `package.json`.
- Path alias: `@/*` → repo root (e.g. `@/lib/db`, `@/components/...`).

## Architecture

Single-DB budgeting app ("Budgeteer"). Two models — `Category` and `Transaction` (1‑to‑many, `onDelete: Cascade`) — with `type` being the string `"income" | "expense"` on both.

**Data flow (read):** server page components (`app/{page,transactions,budgets,reports}/page.tsx`, all `export const dynamic = "force-dynamic"`) call the server-only helpers in **`lib/data.ts`** (`getCategories`, `getTransactions`). Those helpers map Prisma rows to **DTOs** (`lib/types.ts`) and crucially **serialize `Date` → ISO string** so data is safe to hand to client components. Pages compute derived figures with **`lib/calculations.ts`**, then pass DTOs + computed data into client components.

**Data flow (write):** client components (`components/*Manager.tsx`) are the only place mutations happen. They `fetch` the **Route Handlers** under `app/api/{transactions,categories}/...` (POST/PATCH/DELETE), then call `router.refresh()` to re-render the server pages with fresh data. `app/api/transactions/route.ts` GET deliberately reuses `getTransactions()` so the API and SSR return the identical DTO shape.

**Validation lives in the API routes,** not the client. Notably: amounts must be positive finite numbers; dates are parsed and rejected if invalid; and **only `expense` categories may carry a `monthlyLimit`** — both POST and PATCH on categories force the limit to `null` for income categories. Preserve these invariants when editing.

## Date handling (important gotcha)

All month bucketing and date display is done in **UTC**, not local time. Calendar dates entered by the user are stored as UTC midnight, and `lib/calculations.ts` uses `Date.UTC(...)` / `getUTCMonth()` throughout (`monthBounds`, `monthlyTrend`) so month membership is timezone-independent. Display uses `formatDate()` with `timeZone: "UTC"`. When touching anything date-related, stay in UTC or you will reintroduce month-boundary off-by-one bugs.

## UI design system

The app uses a consistent design language — preserve it when adding or editing components.

**Colors:**
- Accent: `indigo-600` / `indigo-50` / `indigo-700` — primary buttons, active nav state, focus rings
- Income: `emerald-600` (amounts), `emerald-500` (accents)
- Expenses: `rose-600` (amounts), `rose-500` (accents)
- Neutrals: `gray-900` text, `gray-500` labels, `gray-400` muted, `gray-200` borders, `gray-100` card borders, `gray-50` input backgrounds

**No emojis.** Navigation and UI icons use inline SVG components defined in their respective files.

**Cards:** `rounded-xl border border-gray-100 bg-white shadow-sm` — no colored backgrounds.

**Inputs:** `border border-gray-200 bg-gray-50 … focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100` — gray fill that clears to white on focus.

**Primary button:** `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg`.

**Type toggles (expense/income):** pill container `rounded-lg border border-gray-200 p-0.5` with active child `bg-white shadow-sm text-gray-900` and inactive `text-gray-400`.

**Progress bars (budgets):** `h-1.5 rounded-full` — color by spend ratio: `bg-indigo-500` (<80%), `bg-amber-400` (≥80%), `bg-rose-500` (≥100%).

**Page headers:** `text-xl font-semibold text-gray-900`, no subtitle paragraphs.

**Section headers inside cards:** `text-sm font-medium text-gray-500`.

**Amounts:** always `tabular-nums`, income `text-emerald-600`, expense `text-rose-600`.

## Tooling

A `PostToolUse` hook in `.claude/settings.json` runs `prettier --write` on every file after `Write` or `Edit`. Files are auto-formatted — no need to run prettier manually.
