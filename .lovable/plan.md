## Restructure Reports Library into two sub-tabs

Split `ReportsLibrary` into two clearly separated sub-tabs at the top of the Reports page:

1. **Reports** (default) — the new interactive reports (currently just "Priority Opportunity Briefing", room to grow)
2. **Templates** — the existing SQL query template grid (unchanged content, just renamed and moved under this sub-tab)

### Changes

**`src/components/tepilot/insights/reports/ReportsLibrary.tsx`**
- Add a local `activeSubTab: 'reports' | 'templates'` state (default `'reports'`).
- Render a segmented sub-tab control directly under the page header (styled to match existing light-theme pill/tab patterns already used elsewhere in the analytics surface — no new dependency).
- When `activeSubTab === 'reports'`: render only the Interactive Reports card grid (drop the "Interactive Reports" section heading since the sub-tab label now conveys it; keep card styling).
- When `activeSubTab === 'templates'`: render only the existing SQL template grid (drop its section heading for the same reason).
- Remove the stacked "Interactive Reports … then Templates" layout — the two are now mutually exclusive views under the sub-tabs.

### Out of scope
- No changes to `AnalyticsContainer` routing, `PriorityOpportunityReport`, `interactiveReportsRegistry`, `InsightStrip`, dashboards, or the SQL template behavior itself.
- No new sidebar entries, no URL/deep-link changes for the sub-tab (local state only, matching how other sibling toggles inside Reports work today).
- No visual redesign of the individual cards.
