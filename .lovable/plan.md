# Merge Risk into the Intelligence Dashboard

Move the standalone **Risk** sidebar tab on /bankdemo into the **Intelligence Dashboard** page as a sub-tab, so the dashboard has two sections: Overview and Risk.

## What changes

- The Customer Intelligence sidebar group loses the "Risk" item. It becomes: Intelligence Dashboard, Customers, Reports & Query, AI Coworker.
- Opening **Intelligence Dashboard** shows a sub-tab bar with:
  - **Overview** (default) — the current dashboard content
  - **Risk** — the existing Financial Vulnerability / risk dashboard, unchanged
- Any existing link or action that pointed at Risk still works: it opens the Intelligence Dashboard with the Risk sub-tab already selected.

## Technical notes

- `VentusAIDashboardView.tsx`: wrap current body in an Overview section, add the shared `SubTabBar` (same pattern as `PersonalizedDealsView`) with `overview` / `risk` items, render `FVIDashboard` for `risk`. Accept an optional `initialSection` prop.
- `AnalyticsContainer.tsx`: remove the `fvi-dashboard` nav item; keep `fvi-dashboard` as a valid `TabValue` and route it to `VentusAIDashboardView` with `initialSection="risk"`. Keep it in `validTabs` so deep links do not bounce.
- Strict light theme, no `dark:` classes; sub-tab styling matches existing sub-tab bars.
