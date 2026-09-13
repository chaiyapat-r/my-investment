# Portfolio & Net Worth Tracker

Personal, single-user web app for tracking net worth and investment performance
across several accounts, plus planning staged stock entries. All data is entered
manually by the owner, roughly weekly. There is no broker API integration.

---

## Scope and non-goals

**Single user.** The owner is the only user. There is no sign-up, no tenancy,
no roles, no sharing.

**Deliberately simple architecture.** Do NOT introduce Clean Architecture
layering, MediatR, CQRS, **a repository abstraction over EF Core**, AutoMapper,
or a full test pyramid. This is a small personal app and that machinery makes it
harder to change, not easier. Prefer:

- ASP.NET Core **API controllers**, grouped by feature (one controller per
  feature), with **dependency injection**
- A thin **service layer** (`Services/`) holding the business logic — money
  math, seeding, auth. Controllers stay thin and delegate to services
- **EF Core** talking to the DbContext **directly from services** — the
  `DbContext` is already a repository + unit of work, so there is **no**
  separate repository layer
- **PostgreSQL** in every environment (local via Docker Compose). Keep
  provider-specific code out of the domain so the DB stays swappable
- **Next.js (App Router, TypeScript, Tailwind)** on the frontend

Write tests for the money math — weighted averages, running averages,
forward-fill, net contribution. Skip tests for CRUD plumbing.

**Money is never a float.** Every monetary or quantity value is `decimal`.
Use `decimal(18,8)` so crypto amounts and fractional shares survive intact.
Store dates as date-only where the time of day carries no meaning.

---

## Part 1 — Net worth tracking

### The central idea

The app answers two different questions from one dataset:

1. **"How much do I have?"** — net worth, all accounts
2. **"How good is my investing?"** — invested accounts only

Every chart draws **two lines**:

- **Market value** — what things are worth
- **Net contribution** — money put in minus money taken out

**The vertical gap between them is profit.** This is the whole point of the
app. If the two lines are not both correct, the app is worthless.

### Entities

```
Account
  Id, Name
  Currency          THB | USD
  Kind              Cash | FX | Equity | Crypto | Liability
  Scope             Banking | Investment
  DisplayOrder, IsArchived
```

Seeded accounts: bank cash (THB, Banking), FX day-trading (USD, Investment),
Webull (USD, Investment), BTC on Bitkub (THB, Investment).

```
Snapshot                              -- the backbone of every chart
  Id, AccountId
  AsOfDate          date only, normally a Sunday
  ValueThb          decimal — source of truth for charting
  NativeAmount      decimal — value in the account's own currency
  NativeCurrency    THB | USD
  FxRateUsed        decimal — 1 for THB accounts
  Note              short free text, shown against the timeline
```

The user converts USD to THB themselves at entry time, so `ValueThb` is
authoritative. `NativeAmount` and `FxRateUsed` are stored anyway so that
currency effect can be separated from performance later. Never drop them.

```
CashFlow                              -- what keeps the net-contribution line honest
  Id, AccountId
  OccurredOn        date only — the REAL date, never rounded to the snapshot week
  Direction         In | Out
  Amount, Currency, FxRateUsed, AmountThb
  CounterAccountId  nullable — set when this is a transfer between the user's
                    own accounts
  Note
```

There is **no Transaction/trade-ledger table.** Accounts are valued purely by
snapshots + cash flows (this is a manual, snapshot-driven tracker with no order
entry). The FX day-trading account, like every account, is valued by snapshots
alone. If a per-trade ledger is ever needed, introduce it then — nothing in the
current schema depends on one.

### Business rules — get these exactly right

**1. Net contribution moves only when money crosses the boundary of the
selected view.**

| Event | Net Worth view | Investment view |
|---|---|---|
| Bank deposit from salary | line moves **up** | not applicable |
| Bank cash → Bitkub / Webull / FX | **no movement** (internal) | line moves **up** |
| Sell BTC, proceeds sit as cash in Bitkub | no movement | no movement |
| Withdraw from a portfolio to spend it | line moves **down** | line moves **down** |

A `CashFlow` with a non-null `CounterAccountId` is internal — it must cancel
out at the level of the view when both accounts are in scope, and count as
external when only one of them is. Implement this by checking whether the
counter account is inside the currently selected scope, not by hard-coding.

**2. Net contribution can go negative.** When more has been withdrawn than
was ever deposited, the value is legitimately below zero and means the capital
has been fully recovered. **Never clamp it with `Math.Max(0, …)`.** This is
not a bug.

**3. Forward-fill missing snapshots.** For any chart date, take each account's
most recent snapshot on or before that date. A skipped week interpolates across
the gap. Never substitute zero for a missing snapshot — that would show a
crash that did not happen. If an account has no snapshot at or before the
date, it contributes nothing rather than zero.

**4. The FX day-trading account is snapshotted on equity, not balance**, so
open positions are included. This is a data-entry convention, not code, but
label the field accordingly in the UI.

**5. Liabilities** are accounts with `Kind = Liability` whose snapshots hold a
negative `ValueThb`. Summation logic needs no special case.

### Percentage returns

`(value − netContribution) / netContribution` breaks when net contribution
approaches or crosses zero. Do not display it in those conditions. When a real
return figure is needed, implement **time-weighted return**, chaining the
sub-period returns between cash flow dates:

```
TWR = Π [ endValue / (startValue + flowsDuringPeriod) ] − 1
```

This is why `CashFlow.OccurredOn` must carry the true date.

---

## Part 2 — Entry ladder planner

Forward-looking, independent of the tracking side. Plans a staged entry into a
stock across several tranches at descending prices, and reports the resulting
average cost per share.

```
EntryPlan
  Id, AccountId (nullable), Symbol, Currency (THB | USD, default USD)
  PlanDate, Status (Active | Completed | Abandoned)

PlanTranche
  Id, PlanId
  DisplayOrder      int — manual ladder position; user reorders with up/down arrows
  Price             decimal
  Budget            decimal — PRIMARY input
  Quantity          decimal — derived, but user-editable
  Filled            bool
  SlPrice, TpPrice  decimal nullable — optional stop-loss / take-profit per rung
```

### Rules

- `Budget` is the primary input; `Quantity = Budget / Price`. **Both fields
  remain editable and update each other:** editing quantity recalculates
  budget; editing budget or **price** holds the budget and recalculates
  quantity.
- Tranches display in a **manual order** the user arranges with up/down arrows
  (persisted as `DisplayOrder`), not sorted by price. Running average is
  accumulated in that displayed order. New rungs append at the bottom and start
  **empty** — no guessed price/budget/quantity.
- Weighted average: `Σ(Price × Quantity) / Σ(Quantity)`
- Two headline figures, always shown together:
  - **Cost so far** — average over tranches where `Filled = true`
  - **If fully filled** — average over all tranches
- The **running cumulative average** column is the most valuable number on the
  screen: the average cost if the user stops after that tranche.
- Fractional shares are normal — never round quantity to an integer.
- Each rung may carry an optional **SL** (stop-loss) and **TP** (take-profit)
  price. From them the ladder derives per-rung **loss-if-SL**
  (`Quantity × (Price − SlPrice)`) and **profit-if-TP**
  (`Quantity × (TpPrice − Price)`), plus per-plan totals over all rungs and a
  reward-to-risk (R:R) ratio. These are computed client-side, never stored.
  Marking a tranche filled toggles `Filled` only — the planner calculates, it
  does not record real fills or place trades.
- There is no capital cap and no average-price marker line on the ladder —
  both were tried and deliberately removed.

---

## API shape

Keep it small. Charting is one endpoint that both views share:

```
GET  /api/chart?scope=networth|investment&accountId=&from=&to=
     -> { points: [{ date, marketValueThb, netContributionThb }] }
```

`accountId` omitted means the combined view. Forward-fill and the internal
versus external cash-flow decision both happen server-side so the frontend
never reimplements them.

Plus straightforward CRUD for accounts, snapshots, cash flows, entry plans,
and tranches, and a weekly bulk-entry endpoint that accepts every account's
value for one date in a single request.

---

## Frontend conventions

- Dark theme. Amber (`#E0A458`) is the primary accent; teal (`#4E9B84`) marks
  realised or filled state; red is reserved for losses and warnings only.
- Monospaced, tabular figures for every number so columns align.
- UI copy is in **Thai**; code, identifiers, and comments in English.
- All displayed money is in THB except inside the entry planner, which is
  denominated per-plan in `EntryPlan.Currency` (default USD, THB supported for
  Thai stocks). The currency symbol and formatting follow that field — never
  hard-code `$`.
- Charts must look correct with only three data points — the first weeks will
  be sparse.
- The weekly entry form is the most-used screen. All accounts on one page, one
  shared FX rate at the top applying to every USD account at once, optional
  note per account. It has to be fast on a phone.

---

## Working agreements

- **Dependencies:** you may add a well-established, actively-maintained library
  without asking first when it materially simplifies the code, improves
  reliability, or improves UX — e.g. icons, a charting/date/validation library,
  a data-fetching cache. Note in your reply what you added and why. Still avoid
  heavy or niche packages for trivial gains, avoid pulling in a lib to replace a
  few lines, and never use one to reintroduce the over-engineering patterns
  banned above (repository layer, CQRS, MediatR, AutoMapper). When in doubt
  between two comparable libraries, pick the lighter, more popular one and say so.
- Prefer editing existing files over creating new ones.
- When a rule here conflicts with a general best practice, this file wins —
  the simplifications are intentional.
