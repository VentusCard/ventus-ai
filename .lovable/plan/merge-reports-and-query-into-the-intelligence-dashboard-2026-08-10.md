# Merge Reports and Query into the Intelligence Dashboard

Move the "Reports & Query" sidebar tab into the Intelligence Dashboard as two separate sub-tabs, matching how Risk was merged.

## What changes

- The Customer Intelligence sidebar group loses "Reports & Query". It becomes: Intelligence Dashboard, Customers, AI Coworker.
- The Intelligence Dashboard sub-tab bar becomes: **Overview · Reports · Query · Risk**.
  - **Reports** — the existing report library (Briefings and Templates), without the Console tab inside it.
  - **Query** — the SQL console on its own.
- "Run in console" on a report template still works: it jumps to the Query sub-tab with the SQL pre-filled.
- Deep links and in-app navigation that pointed at the old Reports tab open the Intelligence Dashboard with the Reports sub-tab selected. Opening an interactive briefing still works and its Back button returns to the Reports sub-tab.

## Technical notes

- `ReportsAndQueryView.tsx`: drop the internal `console` sub-tab and its trigger; keep `briefings` / `templates`. Accept `onRunInConsole(query: string)` and call it instead of switching to the local console. Keep the sessionStorage sub-tab memory limited to the two remaining values.
- `VentusAIDashboardView.tsx`: extend `DASHBOARD_SECTIONS` with `reports` and `query` (order: overview, reports, query, risk). Render `ReportsAndQueryView` for `reports` (passing `onOpenInteractiveReport` through) and `QueryConsoleView` for `query`. Hold a `consoleQuery` state so `onRunInConsole` sets it and switches section to `query`. Widen `initialSection` to `"overview" | "reports" | "query" | "risk"` and add an `onOpenInteractiveReport` prop.
- `AnalyticsContainer.tsx`: remove the `reports` nav item; keep `reports` in `validTabs` and route it to `VentusAIDashboardView` with `initialSection="reports"`, wiring `openInteractiveReport`. Report detail pages keep `onBack={() => setActiveTab('reports')}`.
- Strict light theme; sub-tab styling stays the shared `SubTabBar`.
