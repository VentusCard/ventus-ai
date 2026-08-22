# Remove the Compact/Full toggle on Intelligence Database

Always render the Intelligence Database overview in the "full" state.

## Changes — `dashboard/AnalystDashboardView.tsx`

- Delete the Compact/Full segmented control from the page header (toolbar keeps the date range control).
- Remove the `Density` type, `DENSITY_KEY`, the `density` state, its `localStorage` read/write effect, and `setDensity`.
- Remove the `panel` state and the panel switcher row under "Portfolio analytics".
- Always render every panel stacked (`PANELS.map(...)` in the spaced column), which is the current full-mode layout.
- Drop the now-unused `AnalyticsPanel` type and any imports (`useEffect`, `useState`, `cn`) that no longer have a use after the cleanup.

No other sections change.
