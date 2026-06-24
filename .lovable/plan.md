## Goal

Add a new top-level **Dashboard** tab to `/bankdemo` that gives a SQL/R-style analyst a Shopify-Analytics-shaped landing surface. Existing tabs (Lifestyle Analysis, Outflow Analysis, Subscription Analytics, etc.) stay untouched; the new tab links into them as deep-dives.

## Scope

- One new tab under the **Analytics** nav group, label **Dashboard**, icon `LayoutDashboard`, value `analytics-dashboard`. Becomes the default landing destination from the Analytics group (Lifestyle Analysis stays as-is, accessible from the sidebar).
- All data reuses `getBankwideMetrics`, `getRevenueOpportunities`, `getCrossSellMatrix`, pillar mock data, plus existing outflow/subscription mocks. No new data files.
- Bank-context (no FX selector), no "powered by Shopify" chrome.

## Layout (analyst-dense, gridded, Shopify-style)

```text
┌────────────────────────────────────────────────────────────────────────┐
│  Toolbar: [Date range ▼]  [Compare: Previous period ▼]   Last refresh │
├────────────────────────────────────────────────────────────────────────┤
│  Insight strip (3 rotating callouts pulled from revenueOpportunities) │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────┤
│ Accounts     │ Annual spend │ Avg spend /  │ Cross-sell   │ Wallet   │  ← KPI tiles
│ 120.0M  ▲2% │ $385B   ▲4% │ user $5.1K  │ index 7.8    │ share 38%│     w/ sparkline + delta
├──────────────┴──────────────┴──────────────┴──────────────┴──────────┤
│ Spend by lifestyle pillar (donut)  │  Spend over time (line)         │
├────────────────────────────────────┼─────────────────────────────────┤
│ Top pillars table                  │  Spend by card product (bars)   │
├────────────────────────────────────┼─────────────────────────────────┤
│ Cross-sell matrix preview          │  Outflow by competitor (bars)   │
├────────────────────────────────────┼─────────────────────────────────┤
│ Subscription churn cohort          │  Revenue opportunities list     │
└────────────────────────────────────┴─────────────────────────────────┘
```

Card chrome matches Shopify Analytics: thin `border border-slate-200`, white surface, 12px label, large number, small delta chip vs comparison, sparkline, and a `…` menu in the top-right of every card with `Open detail` (deep-links into the corresponding existing tab via `setActiveTab`) and `Export CSV` (stub that fires a toast).

## Toolbar behavior

- **Date range**: presets `Last 7 days`, `Last 30 days`, `Last 90 days`, `Quarter-to-date`, `Year-to-date`, `Custom…` (shadcn `Calendar` in a popover). Default `Last 30 days`.
- **Compare**: `No comparison`, `Previous period`, `Previous year`. Default `Previous period`.
- Range + compare live in local component state and feed a context object passed to each card. Because mocks are static, deltas are derived deterministically (seeded by range length) so numbers move plausibly when the user changes the range.

## Insight strip

Top of page: 3 horizontally-scrollable insight chips generated from `getRevenueOpportunities(filters)` — title + one-line "why" + "See why" link that switches the active tab to the relevant deep-dive (Lifestyle Analysis, Outflow Analysis, etc.).

## Files

New:
- `src/components/tepilot/insights/dashboard/AnalystDashboardView.tsx` — page composition.
- `src/components/tepilot/insights/dashboard/DashboardToolbar.tsx` — date-range + compare control.
- `src/components/tepilot/insights/dashboard/MetricTile.tsx` — KPI tile w/ sparkline + delta chip + `…` menu.
- `src/components/tepilot/insights/dashboard/ChartCard.tsx` — card wrapper (title, action menu, body slot).
- `src/components/tepilot/insights/dashboard/InsightStrip.tsx` — rotating insights row.
- `src/components/tepilot/insights/dashboard/useDashboardRange.ts` — range + comparison state + seeded delta helper.

Edited:
- `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Add `'analytics-dashboard'` to `TabValue`.
  - Add nav item `{ value: 'analytics-dashboard', label: 'Dashboard', icon: LayoutDashboard }` as the first item in the **Analytics** group.
  - Switch `defaultTab` from `'ventus-ai'`-only behavior unchanged, but allow `AnalystDashboardView`'s `onNavigate` callback to call `setActiveTab` for deep-dive links.
  - Pass `setActiveTab` into the new view.

No edits to `BankwideView` or any other existing tab.

## Charts

Use existing `recharts` (already in the project — already imported by `BankwideMetrics`, `WalletShareTrendChart`, etc.):
- Donut: pillar share.
- Line + area: synthetic time series derived from `TOTAL_ANNUAL_SPEND` × seeded daily noise across the selected range.
- Horizontal bars: card products, competitor outflow.
- Sparklines inside KPI tiles: `<LineChart>` 40px tall, no axes.

## Out of scope

- No SQL viewer, CSV export wiring (button stubs only — toast "Export queued").
- No changes to existing analytics tabs.
- No new mock datasets.
- No currency selector.
