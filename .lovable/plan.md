## Goal

Replace the three existing Analytics sidebar entries (Lifestyle Analysis, Outflow Analysis, Subscription Analytics) with a single **Reports** entry that opens a Shopify-style report library: a categorized index of 10 prebuilt templates, each one a full report page with toolbar + chart + data table.

## Sidebar changes

`src/components/tepilot/insights/AnalyticsContainer.tsx`
- Analytics group becomes:
  - `Dashboard` (existing)
  - `Reports` (new, icon `FileBarChart`)
- Remove nav items: `dashboard` (Lifestyle Analysis), `wallet-share` (Outflow Analysis), `subscription-analytics`. Their render cases stay in the switch (so existing `setActiveTab` deep-links from the dashboard still work) — they're just no longer in the sidebar.
- Add `TabValue` values: `'reports'` plus one per template (`'report-lifestyle-pillars'`, `'report-outflow'`, `'report-subscription'`, `'report-pillar-deep-dive'`, `'report-cross-sell'`, `'report-regional-spend'`, `'report-cohort-retention'`, `'report-top-merchants'`, `'report-life-events'`, `'report-fvi'`).

## Reports library page

`src/components/tepilot/insights/reports/ReportsLibrary.tsx`
- Shopify-style index: title, short blurb, search box, category filter chips (`All`, `Lifestyle`, `Outflow`, `Retention`, `Risk`).
- Grid of 10 cards (3-up). Each card: small icon, category chip, title, 1-line description, "Last run" timestamp (mock), `Open report` button.

The 10 templates (all built on existing mock data):

| # | Title | Category | Source data |
|---|-------|----------|-------------|
| 1 | Lifestyle pillar share | Lifestyle | `getPillarDistribution` + `getBankwideMetrics` |
| 2 | Pillar deep-dive (age × region) | Lifestyle | `getPillarDeepDiveMatrix` |
| 3 | Cross-sell propensity matrix | Lifestyle | `getCrossSellMatrix` |
| 4 | Outflow to competitors | Outflow | existing `WalletShareView` data |
| 5 | Top merchant outflow | Outflow | `CompetitorOutflowTable` data + top-N |
| 6 | Subscription churn cohort | Retention | `SubscriptionAnalyticsView` data |
| 7 | Spend by region | Lifestyle | `GEOGRAPHIC_REGIONS` |
| 8 | Cohort retention (sign-up month) | Retention | synthesized from `CARD_PRODUCTS` (seeded) |
| 9 | Life-event volume | Lifestyle | existing life-event mocks |
| 10 | Financial vulnerability summary | Risk | existing FVI cohort data |

## Reusable report page chrome

`src/components/tepilot/insights/reports/ReportPageShell.tsx`
- Header: back-arrow (returns to Reports library), report title, last-run timestamp, `Export CSV` / `Schedule` (stubbed) buttons.
- Reuses `DashboardToolbar` (date range + compare) from `dashboard/`.
- Slot for primary chart (top) and slot for data table (bottom).
- Single chrome shared by all 10 reports for a uniform Shopify-Reports feel.

`src/components/tepilot/insights/reports/ReportDataTable.tsx`
- Compact dense table: small caps headers, tabular-nums, row hover, sticky header, optional sparkline column, delta column when comparison is on. Used by every report.

## 10 report page components

`src/components/tepilot/insights/reports/pages/`
- `LifestylePillarReport.tsx` — donut + table (pillar, share, $ spend, Δ).
- `PillarDeepDiveReport.tsx` — age × region heatmap (reuse `PillarDeepDiveHeatmap`) + table.
- `CrossSellReport.tsx` — heatmap matrix + table (from-card → to-card, users, est uplift, conv %).
- `OutflowCompetitorReport.tsx` — horizontal bar + table (competitor, outflow $, share, Δ).
- `TopMerchantOutflowReport.tsx` — bar + table (merchant, category, outflow $, users).
- `SubscriptionChurnReport.tsx` — cohort grid + table.
- `RegionalSpendReport.tsx` — bar + table (region, accounts, spend $, $/user, Δ).
- `CohortRetentionReport.tsx` — triangle cohort heatmap (seeded from `CARD_PRODUCTS`) + retention table.
- `LifeEventVolumeReport.tsx` — stacked bar by month + table (event type, count, MoM Δ).
- `FviSummaryReport.tsx` — bar + table (cohort, customers, severity, Δ).

Each page reuses `ReportPageShell`, `DashboardToolbar`, `useDashboardRange`, `deltaFor`, and `ReportDataTable`. Where heatmaps already exist (pillar deep dive, FVI dashboard chart), wrap the existing component; do NOT rebuild.

## Wiring

In `AnalyticsContainer.renderContent()`:
- `'reports'` → `<ReportsLibrary onOpen={setActiveTab} />`
- `'report-*'` → corresponding report page, each receiving `onBack={() => setActiveTab('reports')}`.
- Keep `case 'dashboard'`, `case 'wallet-share'`, `case 'subscription-analytics'` in the switch (no sidebar entry) so dashboard deep-links still work.

Dashboard tile deep-links in `AnalystDashboardView` are repointed from `'dashboard'`/`'wallet-share'`/`'subscription-analytics'` to the new corresponding `'report-*'` values.

## Out of scope

- No new data files. All reports use existing mock data.
- No real CSV export, no real scheduling. Buttons fire `toast` stubs.
- No edits to the rendered content of `BankwideView`, `WalletShareView`, `SubscriptionAnalyticsView` — they remain reachable through dashboard deep-links and continue to render via their existing components.
