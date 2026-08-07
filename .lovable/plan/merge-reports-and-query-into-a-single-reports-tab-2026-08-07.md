# Merge Reports and Query into a single Reports tab

## Goal

Consolidate the two Intelligence-section items (`Reports` and `Query`) into one sidebar tab called **Reports & Query**. Inside that tab, use three sub-tabs:

1. **Briefings** — the existing interactive reports (currently Priority Opportunity).
2. **Templates** — the existing SQL template library.
3. **SQL Console** — the existing Query editor, results, chart, and AI generator.

Clicking a template will load its SQL directly into the SQL Console sub-tab instead of jumping to a separate sidebar tab.

## Why this approach

- Matches the user's choice: a single Reports tab with sub-tabs.
- Keeps the current mental model: read-only briefings, reusable templates, and ad-hoc SQL each have their own space.
- Reduces sidebar clutter in the Intelligence group.
- Reuses all existing components (`ReportsLibrary`, `QueryConsoleView`, report pages) with minimal re-wiring.

## Files to change

### 1. `src/components/tepilot/insights/AnalyticsContainer.tsx`

- Remove `query` from the `TabValue` union.
- Remove the `Query` item from the Intelligence `NAV_GROUPS` entry.
- Remove `pendingQuery` / `openInQuery` state and the `case 'query':` render branch.
- Render the unified reports view for `case 'reports'`.
- Keep all `report-*` deep-link tab values and the back navigation to `'reports'`.

### 2. New or updated reports wrapper

- Create `src/components/tepilot/insights/reports/ReportsAndQueryView.tsx` (or extend `ReportsLibrary.tsx`) to own:
  - `subTab` state: `"briefings" | "templates" | "console"`
  - `consoleQuery` state for the SQL loaded from a template
  - Sub-tab bar styled like the existing Reports/Templates tabs
  - Conditional rendering:
    - `briefings` → existing interactive-reports grid
    - `templates` → existing template grid
    - `console` → `<QueryConsoleView initialQuery={consoleQuery} />`
- Update template card click handler to `setSubTab("console"); setConsoleQuery(t.query)` instead of calling `onOpenQuery`.
- Keep the search and category filters on the Templates sub-tab.

### 3. `src/components/tepilot/insights/reports/ReportsLibrary.tsx`

- Either refactor into the new wrapper or delete if its logic is absorbed. If absorbed, update imports in `AnalyticsContainer.tsx`.

### 4. Interactive report pages (`src/components/tepilot/insights/reports/pages/*.tsx`)

- No functional changes; back buttons already return to `'reports'`, which is correct.

### 5. `src/components/tepilot/insights/query/QueryConsoleView.tsx`

- No changes required; it already accepts `initialQuery` and runs it on mount / update.

## Navigation behavior

- Sidebar Intelligence group becomes: Ventus AI Dashboard → Reports.
- Reports default sub-tab: **Templates** (matches current default).
- Briefings count badge and Templates count badge remain in the sub-tab labels.
- SQL Console sub-tab shows a small "SQL" or terminal icon and can be reached from a template click or directly.

## Visual / copy updates

- Rename the existing "Reports" sub-tab label to **Briefings** to avoid confusion with the parent tab name.
- Keep the strict light-theme styling, slate-200 borders, and existing component variants.

## Validation

- Run `bunx tsc --noEmit` or the project's typecheck command.
- Manual click-through:
  1. Open `/bankdemo` → Intelligence → Reports.
  2. Confirm sub-tabs: Briefings, Templates, SQL Console.
  3. Click a template → should land in SQL Console with the query loaded and results visible.
  4. Edit/run the query → results update.
  5. Switch back to Templates/Briefings without losing console state.
  6. Open Priority Opportunity briefing → back button returns to Reports tab on the Briefings sub-tab.

## Out of scope

- No changes to the SQL engine, dataset, or AI query generation.
- No new interactive reports or templates.
- No backend or edge-function changes.