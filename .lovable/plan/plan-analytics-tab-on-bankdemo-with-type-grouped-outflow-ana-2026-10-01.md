# Plan: Analytics tab on /bankdemo with type-grouped outflow analysis

## What you'll see

A new **Analytics** tab in the /bankdemo sidebar, under Customer Intelligence, directly below **Intelligence Database** and above **Ask Ventus AI**. It opens on an **Outflow Analysis** view where money leaving the bank is organized **by product type first** — High-Yield Savings (Marcus by Goldman Sachs, Ally), Brokerage/Investment (Wealthfront, Robinhood), Credit Cards, Mortgage, Personal Loans, BNPL, Rent, Auto Loans, Student Loans, Utilities, Insurance, Childcare, Subscriptions — and only then by individual destination within each type.

## Changes

### 1. Sidebar tab (`AnalyticsContainer.tsx`)
- Add an `Analytics` item (BarChart3 icon) to the Customer Intelligence nav group, below "Intelligence Database".
- Register a new tab value `outflow-analytics` in `TabValue` and map it in `renderContent()` (the existing `analytics` / `analytics-dashboard` values are already taken by the Intelligence Database, so a fresh key avoids collisions).

### 2. Analytics view with type-grouped outflow
- New `AnalyticsView` component with a `SubTabBar` (same pattern as Merchant Partnerships):
  - **Outflow & Wallet Share** (default) — reuses `WalletShareView` data and components, with the outflow table reworked to group by product type:
    - Type sections sorted by total outflow (largest leak first), each with a type header row showing the type name, aggregate outflow, and affected customers.
    - Destinations listed within each type, sorted by outflow (e.g. High-Yield Savings: Marcus $4.8B, Ally $3.2B).
    - Keep the existing headline metrics, outflow-by-category chart, trend chart, and win-back recommendations.
  - **Portfolio Pillars** — reuses the existing bankwide pillar spending view.
  - **Subscription Analytics** — reuses the existing subscription analytics view.
- Grouping uses the existing `productCategory` / `type` fields on `CompetitorOutflow` — no data model changes needed; Marcus by Goldman Sachs and Ally already exist as High-Yield Savings rows.

### 3. Slide 9 on /deckmo
- The new tab appears automatically in the embedded platform sidebar on Slide 9 (it renders the real AnalyticsContainer). No deck script changes unless you later want it as a dedicated beat.

## Technical details
- Files touched: `src/components/tepilot/insights/AnalyticsContainer.tsx` (nav + routing), new `src/components/tepilot/insights/AnalyticsView.tsx`, and a grouping variant in `CompetitorOutflowTable.tsx` (opt-in prop so the existing flat table elsewhere is unchanged).
- Strict light theme, Manrope, existing semantic tokens — no new colors.
- Verify on /bankdemo (tab renders, groups sorted, totals match flat view) and on /deckmo Slide 9 sidebar.
