# Design Brief — Personal Portfolio & Net Worth Tracker

> Note for Claude Design: please start from a fresh visual direction.
> Do **not** inherit the existing "T Broker Design System" (navy/orange corporate insurance branding).
> This is a personal, private tool with a different feel entirely.

---

## 1. What this is

A private, single-user web app for tracking total net worth and investment
performance across several accounts. All data is entered **manually** by the
owner, roughly once a week. There is no broker API integration, no multi-user
support, no sign-up flow, no marketing pages.

**Primary question the app answers:**
"How much do I have right now, across everything — and how much of the growth
was actually my investing, versus just money I put in?"

## 2. Who uses it

One person. A full-stack developer who trades actively. Comfortable with dense
information. Does not need onboarding, tooltips explaining what a portfolio is,
or hand-holding. Values speed of data entry above almost everything else.

Primary usage pattern:
- **Weekly, ~5 min:** enter this week's balances (the most important flow)
- **Occasionally:** browse charts, check how a specific account is doing
- **Rarely:** record a transfer between accounts

Likely to check on **mobile** as often as desktop.

## 3. Accounts being tracked

| Account | Currency | Scope |
|---|---|---|
| Bank cash | THB | Banking |
| FX day-trading account | USD | Investment |
| Webull | USD | Investment |
| BTC on Bitkub | THB | Investment |

All USD values are converted to THB by the user at entry time. Everything in
the UI is displayed in **THB**.

## 4. Core concepts to express visually

These three ideas need to come across clearly — they are the heart of the app.

**a) Market value vs. cost basis**
Every chart shows two lines:
- **Market value** — what the account is worth
- **Net contribution** — money put in minus money taken out

The **vertical gap between them is profit**. This gap is the single most
important thing to communicate. Deposits appear as both lines stepping up
together; withdrawals as both stepping down together.

Net contribution **can go negative** (when more has been withdrawn than
deposited). The design must handle a line crossing below zero gracefully.

**b) Two lenses on the same data**
A prominent toggle switches between:
- **Net Worth** — all accounts including bank cash. "What do I have?"
- **Investment** — invested accounts only. "How good am I at this?"

The same charts and numbers re-scope when toggled. This should feel like
changing a lens, not navigating to a different page.

**c) Per-account drill-down**
The combined view breaks down into individual accounts, each with its own
two-line chart. Bank cash is the exception — it shows a single line only,
since cost basis is meaningless for a checking account.

## 5. Screens needed

**Screen 1 — Dashboard (most important)**
- Total value in THB, large and immediately readable
- Change since last week, and cumulative profit
- The main two-line chart, weekly x-axis
- Net Worth / Investment toggle
- A compact row or grid of the accounts with current value and change
- Allocation breakdown (how much sits in each account)

**Screen 2 — Weekly entry form (design this carefully)**
This gets used more than any other screen, so it should be genuinely fast.
- All accounts on one screen, one number each — not a wizard, not one per page
- For USD accounts: fields for native amount, FX rate, and resulting THB value
- One shared FX rate at the top that applies to all USD accounts at once
- An optional short note per account ("closed XAUUSD at a loss", "bought more BTC")
- Should be comfortable to fill in on a phone

**Screen 3 — Account detail**
- Two-line chart for that account alone
- History of entries and transfers
- Notes shown against the timeline so past weeks can be explained

**Screen 4 — Record a transfer / deposit / withdrawal**
- Needs to clearly distinguish **money moving between my own accounts**
  (does not change net worth) from **money entering or leaving entirely**
  (does change it). Getting this wrong corrupts the data, so the distinction
  must be visually unmistakable, not buried in a dropdown label.

**Screen 5 — Entry ladder planner**
A forward-looking tool, separate from the tracking screens above. Plans a
staged entry into a stock: several buy tranches at descending prices, showing
what the average cost per share ends up being.

A working prototype of this screen has already been validated — match its
behaviour, improve its visual design.

Structure: a **card per plan**, containing **card-items for each tranche**.
- Plan header: ticker symbol, plan date, delete
- Two headline figures side by side, and this pairing matters:
  - **Cost so far** — average across tranches already bought
  - **If fully filled** — average across all planned tranches
  Between them they show where the position stands versus where it's headed.
- A list of tranches, each with: an order marker doubling as a
  bought/not-bought toggle, price, budget, share count, and a running
  cumulative average
- Full CRUD on both levels: add, edit, and delete plans and tranches at any time

Behaviour worth preserving:
- Budget per tranche is the primary input; share count is derived, but both
  fields stay editable and update each other
- Editing the price holds the budget steady and recalculates shares
- Tranches sort by price, highest first
- The **running cumulative average column** is the most valuable number on the
  screen — it answers "if I stop after this tranche, what's my cost?"
- Fractional shares throughout, so share counts carry decimals

## 6. Design direction

- **Calm, not a trading terminal.** This is reviewed weekly over coffee, not
  watched tick by tick. Avoid flashing, avoid dense blinking numbers.
- **Charts are the product.** They deserve real space, especially on mobile.
- **Dark mode preferred** as the primary theme.
- Red/green for gains and losses, but restrained — not neon.
- Numbers are the hero. Use a typeface with good tabular figures so columns of
  Thai baht amounts align cleanly.
- Should look good showing a **small amount of data** — in week 3 there will be
  only three data points, and it must not look broken or empty.
- Handle **missing weeks** gracefully: if a week was skipped, the line
  interpolates across the gap rather than dropping to zero.

## 7. Explicitly out of scope

No landing page, no settings sprawl, no notifications, no social or sharing
features, no news feed, no watchlist, no order entry. The planner does not
place trades — it only calculates.

There **is** a single login screen. The app is private and sits behind a
single-user password gate (cookie session). This is access control, not a
sign-up flow — there is no registration, no roles, no multi-user support.
