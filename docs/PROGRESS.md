# Progress & Handoff

Running state of the build, so a new session can continue. Read this together
with `CLAUDE.md` (spec) and `docs/data-model.md` (schema/auth/deploy).

Last updated: 2026-08-13.

---

## What's built and working

**Backend** (`backend/`, .NET 9 Minimal-hosting + **controllers + service layer + DI**, no repository):
- 6 entities + enums (`Domain/`), `AppDbContext` (`Data/`), migrations applied.
  (Transaction entity + TradeSide enum **removed** — no trade ledger; the app is
  snapshot-driven with no order entry. Migration `RemoveTransactionsAndTrancheActuals`
  also dropped `plan_tranches.filled_on/actual_price/actual_quantity`.)
- **Auth** — cookie session (HttpOnly/Secure/SameSite=Strict, sliding 1 day).
  `AuthController` + `AuthService`. `/api/auth/login|logout|me`. Single user
  seeded from config (`appsettings.Development.json` →
  `Auth:Username`/`Auth:PasswordHash`; prod via env `Auth__Username`/`Auth__PasswordHash`).
  Password hash helper: `dotnet run --no-build -- hash <password>` (use
  `--no-build` when the API is running, else the Api.exe lock fails the build).
  To change creds: generate a hash, put it in config, then update the existing
  `users` row (seeding only runs when the table is empty).
- **CRUD** controllers+services: Accounts, Snapshots (+bulk weekly entry),
  CashFlows, EntryPlans (+tranches). All `[Authorize]`.
- **`/api/chart`** — the two-line engine. Pure math in `Services/ChartCalculator.cs`
  (unit-tested, `backend.Tests/`, 14 tests). `ChartService` loads data.
- **`/api/history`** — combined snapshot + cash-flow ledger for the history tab.
  `HistoryController` + `HistoryService`. Query: `accountId` (omit = all), `type`
  (`all|snapshot|flow`), `page`, `pageSize` (default 15). Merges both sources,
  sorts newest-first (id-desc tiebreak), pages **in memory** — deliberate: the
  ledger is a few hundred rows and two heterogeneous sources can't be paged in one
  SQL query. Returns `{ items, page, pageSize, total, totalPages }`; each item
  carries the raw `snapshot`/`flow` so the edit modals reuse it.
- Swagger at `/swagger` (dev only).

**Frontend** (`frontend/`, Next.js 16 App Router + TS + Tailwind v4):
- **Shared layout via `(app)` route group.** Authed pages live under
  `app/(app)/` (group name doesn't change URLs — still `/` and `/planner`) sharing
  `app/(app)/layout.tsx` → `<AppShell>` (`components/ui/AppShell.tsx`), which
  renders the single `Sidebar` + flex shell once; each page supplies its own
  `<main>`. `login`/`entry`/`api` stay outside the group (no sidebar). The
  Sidebar is logo + a door (logout) icon in the brand row + nav; logout sits at
  the top so long content never pushes it away. The "last updated" date lives
  only in the dashboard header now.
- **Feature-module structure** (refactor complete). `app/**/page.tsx` are thin
  (`return <XxxModule/>`); each feature lives in `modules/<Name>/` with
  `<Name>Module.tsx` (client entry), `hooks/`, `components/`, `*.types.ts`, and
  pure helpers. Modules: `Dashboard/`, `History/`, `Planner/`, `Auth/` (login),
  `Tracking/` (the five shared modals). Brand-agnostic shared UI is `components/ui/` (`Modal`,
  `NumberInput`, `Sidebar`, `Sparkline`, `Spinner`, `TwoLineChart`). Data flows
  client → `lib/api` (`apiFetch`) → `app/api/**/route.ts` (BFF) → .NET; no
  next.config rewrite. `API_PROXY_URL` is read at **request time** by the route
  handlers, so in Docker it's a **runtime** env on the `web` service (compose
  `environment:`), not a build arg.
- `proxy.ts` optimistic redirect (Next 16 renamed middleware→proxy).
- **API layer = BFF via Route Handlers** (refactor in progress). The browser calls
  same-origin `/api/*`, handled by `app/api/**/route.ts` handlers that forward to
  the .NET backend server-side via `lib/api/backend.ts` (`forward()` — relays the
  session cookie both ways, base URL `API_PROXY_URL`, default `:5153`). The old
  blanket `next.config.ts` rewrite is **removed**. Client calls still go through
  `lib/api` (`apiFetch`, `@/lib/api` re-exports `client.ts`). Route handlers exist
  for accounts, chart, snapshots(+bulk,+[id]), cashflows(+[id]), history,
  entry-plans(+[id],+tranches,+[trancheId]), auth/[action].
- `/login` page. `/` = **Portfolio** — refactored into `modules/Dashboard/`:
  `DashboardModule.tsx` entry, `hooks/useDashboard.ts` (scope/drill-down/chart
  data/modals/derived figures), `summarise.ts` (pure), `DashboardModule.types.ts`,
  `components/{DashboardTabs,Hero,AccountGrid,AccountCard,AllocationPanel}.tsx`.
  `app/page.tsx` is a thin server component (`return <DashboardModule/>`).
  A **two-tab page**: **ภาพรวมพอร์ต** (overview) and **ประวัติรายการ** (renders
  `<HistoryModule/>`); the global action buttons (เงินเข้า/ออก, บันทึกยอด) stay in
  the header on both.
  Dashboard matches `docs/Portfolio Dashboard (Standalone).html` closely
  (palette/spacing/fonts extracted from the mockup's computed styles).
- **Sidebar** (`Sidebar.tsx`) is responsive: full rail on `lg`+, a hamburger →
  slide-in drawer (overlay, Esc/overlay/nav-tap to close) below `lg`. Pages get
  `pt-16 lg:pt-7` so the fixed hamburger clears the header. Brand mark is an inline
  two-line SVG (market vs. contribution) — the old gold "พ" tile is gone.
- **ภาพรวมพอร์ต tab** features: sidebar (logo, nav, "อัปเดตล่าสุด" box, logout),
  scope pill (net worth / investment), big totals + %, two-line SVG chart
  (`TwoLineChart.tsx`) with hover tooltip (ตลาด/ลงทุน/กำไร + divider), account
  cards (sparkline, click→drill-down chart, hover edit/delete), allocation panel.
- **ประวัติรายการ tab** (refactored into `modules/History/`: `HistoryModule.tsx`
  entry, `hooks/useHistory.ts` filters+fetch+delete, `HistoryModule.types.ts`, and
  `components/{HistoryFilters,HistoryRow,Pagination}.tsx`. Dashboard renders
  `<HistoryModule accounts refreshKey onChanged/>` as its second tab.) — combined
  ledger of **all accounts**
  as a table: วันที่ · บัญชี (colour dot) · ประเภท (chip: ยอดคงเหลือ/เงินเข้า/
  เงินออก) · รายละเอียด (`$native × fx` for USD) · จำนวน ฿ · โน้ต · แก้/ลบ (hover).
  Filters: account dropdown + type chips. **Numbered pagination** (‹ 1 2 3 … ›,
  15/page) driven by `/api/history`. Rows join `accountId`→account (from the
  page's `allAccounts`) for name/colour/currency. Edit/delete reuse
  `EditSnapshotModal` / `CashFlowModal` (edit mode) and refresh both the table and
  the overview totals. This is where the old "edit/delete only via DB" gap is now
  closed (previously a per-account panel in the drill-down; moved here as a tab).
- **Confirm dialogs** use a themed `ConfirmDialog` (`components/ui/ConfirmDialog.tsx`),
  not `window.confirm`. `ConfirmProvider` sits in `app/(app)/layout.tsx`; call
  `const confirm = useConfirm()` then `await confirm({ title, message, confirmLabel,
  danger })` → resolves `boolean`. Used at all three delete sites (account, plan,
  history row).
- Modals live in `modules/Tracking/components/` (shared by Dashboard/History/
  Planner): **บันทึกยอด** (weekly bulk snapshot, `WeeklyEntryModal` — date defaults
  to **today**, not last Sunday), **เงินเข้า/ออก** (cashflow, in/out only —
  `CashFlowModal` now doubles as the **edit** modal via an optional `flow` prop),
  **เพิ่มบัญชี/แก้ไขบัญชี** (`AddAccountModal`, add+edit), **แก้ไขยอดคงเหลือ**
  (`EditSnapshotModal`), **เพิ่มแผนเข้าซื้อ** (`AddPlanModal`).
- **`/planner` — Entry ladder planner** (refactored into `modules/Planner/`:
  `PlannerModule.tsx` client entry, `hooks/usePlanner.ts` state+CRUD,
  `compute.ts` pure ladder math, `PlannerModule.types.ts`, and
  `components/{PlanCard,TrancheRow,RiskRewardStrip,TrancheField}.tsx`. The route
  `app/planner/page.tsx` is now a thin server component: `return <PlannerModule/>`.
  Ported from `docs/entry-plan-prototype.jsx`.) "+ เพิ่มแผน" opens `AddPlanModal` (symbol /
  currency USD·THB / date) → POST, then the plan card appears **newest on top**.
  Search box filters plans by symbol (case-insensitive). Per plan: two headline
  averages (ต้นทุนเฉลี่ยตอนนี้ = filled avg, ถ้าซื้อครบแผน = all), a ladder of
  tranches (order marker doubles as filled toggle, price/budget/qty, running
  cumulative avg), full CRUD. **Budget↔qty recalc live** (editing price/budget
  holds budget & recalcs qty; editing qty recalcs budget); tranche field edits
  persist **on blur**, toggle/add/delete persist immediately. Currency symbol
  follows `plan.currency` (never hard-coded `$`).
- **Planner uses 2-decimal values** (owner's choice). All ladder inputs
  (price/budget/qty/SL/TP) accept at most 2 decimals via `NumberInput maxDecimals={2}`,
  and derived values round to 2 dp (`compute.ts trim()`); the "x หุ้น" headline uses
  `sh()` at 2 dp too. This intentionally relaxes CLAUDE.md's "never round quantity"
  for the forward-looking planner only — the tracking side (snapshots/cash flows) is
  unaffected and still `decimal(18,8)`.
- **SL / TP per tranche** — each rung has optional `SL` and `TP` price inputs
  plus derived **ขาดทุน** (`qty × (price − SL)`) and **กำไร** (`qty × (TP − price)`).
  Each tranche is a compact **card** (`TrancheRow`), not a table row: the order
  toggle sits left (vertically centred), delete sits right (vertically centred),
  and the fields fill the middle — a "buy" row (ราคา/งบ/หุ้น, full-width inputs so
  large budgets aren't truncated) above an inline SL→ขาดทุน / TP→กำไร row. No
  per-tranche running average (removed to keep rows short); the plan-level
  averages still show at the top. Responsive (no horizontal scroll on mobile).
  A risk/reward
  strip above the ladder sums **ขาดทุนถ้าโดน SL ทั้งหมด**, **กำไรถ้าโดน TP ทั้งหมด**
  (over **all** tranches) and the **R:R** ratio. `SlPrice`/`TpPrice` are stored
  (nullable `numeric(18,8)`, migration `AddTrancheSlTp`); loss/profit are derived
  client-side, not stored.
- `/entry` is a stub (weekly entry lives in the dashboard modal instead).

---

## Key decisions made (not obvious from code)

- **snake_case DB naming** — via `EFCore.NamingConventions` + `UseSnakeCaseNamingConvention()`.
  Tables are `cash_flows`, columns `amount_thb` etc. Query in DBeaver without quotes.
- **Banking accounts = net contribution.** A Banking-scope account's balance
  (snapshot) counts as net contribution AND market value → sits on both chart
  lines → never creates a profit gap. Banking-account cash flows are **ignored**
  (would double-count). Bank drill-down shows one line labelled "เงินลงทุนสุทธิ".
  This is the elegant model that keeps net-worth profit = pure investment gains.
- **Transfer feature removed.** Moving money bank→investment = record a plain
  "เงินเข้า" on the investment account. The bank's balance drop (via weekly
  snapshot) balances it. CashFlowModal excludes Banking accounts.
- **`Account.Color`** column added (nullable hex) — user picks a colour in the
  add-account modal (native `<input type=color>`); falls back to kind-derived.
- Architecture reversed from original CLAUDE.md to **controllers + services + DI**
  (still NO repository over EF). CLAUDE.md already updated to match.
- Chart lib: **none** — custom inline SVG (control over the profit-gap look).
  Icons: `lucide-react`.

---

## How to run (dev)

```bash
docker compose up -d db                 # Postgres 16 on host port 5435
cd backend && dotnet run --launch-profile http   # API on :5153, Swagger /swagger
cd frontend && npm run dev              # :3000  → open this, login with the Auth creds from config
```

- `api` and `web` are behind the `full` compose profile, so `up -d db` never
  starts them and grabs ports. Full stack rehearsal: `docker compose --profile full up --build`.
- App URL http://localhost:3000. DB host port **5435** (5432 was taken by another
  project). Connection string in `appsettings.Development.json`.

---

## Gotchas (learned the hard way)

- **Never kill `com.docker.backend` / `wslrelay`** — that's Docker Desktop's engine;
  killing it takes Docker down.
- Migrations need the backend **stopped** (Api.exe file lock). Stop the `Api`
  process on :5153, run `dotnet ef …`, then restart. Don't kill non-Api processes.
- After `dotnet ef migrations add`, **don't** `database update --no-build`
  (the new migration isn't compiled yet). Build first.
- snake_case migration also renames `__EFMigrationsHistory` columns — had to
  `ALTER TABLE "__EFMigrationsHistory" RENAME COLUMN "MigrationId" TO migration_id`
  (and product_version) once, manually, before it applied.
- The Standalone mockup renders in the in-app browser via `file://`; extract its
  computed styles with `javascript_tool` to match design precisely (better than
  screenshots, which fail when the browser pane isn't displayed).

---

## Current data = messy test data

The DB has test data from many verification runs (a stray bank cash flow that
caused a double-count, investment contributions > current values so profit shows
negative, an empty "บัญชีหุ้นไทย"). **Offer to wipe test data** (keep user + the
4 seeded accounts; clear snapshots/cash_flows/extra accounts) so the owner can
enter real data.

---

## Suggested next steps

- **Clean test data** for a fresh start — DB still holds verification data
  (messy snapshots/cash flows, the NVDA entry plan). Keep user + the 4 seeded
  accounts; clear the rest.
- ~~**`/entry` stub**~~ — **done.** Now a server-side `redirect("/")` (the
  weekly-entry modal lives on the dashboard). Nothing links to it; old links bounce
  to the dashboard.
- **Account detail page** — *optional.* Its content is already covered by the
  overview drill-down chart + the history tab's per-account filter; only build a
  dedicated page if a single-screen (chart + timeline) view is wanted.

Done this session: ~~Entry planner~~, ~~edit/delete snapshots & cash flows~~
(history tab), ~~SL/TP on tranches~~, ~~removed Transaction table + tranche
actual-fill fields~~. The old "marking filled creates a Transaction" follow-up is
**cancelled** — the Transaction table was removed (planner calculates only).
