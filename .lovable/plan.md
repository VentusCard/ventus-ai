## Compact Stats + Search Bar Row

### Problem
The three stat pills (`200 Deals`, `5.4M Activations`, `70% Avg Rate`) currently render on their own full-width row above the search bar, wasting vertical space.

### Solution
Merge the stats row and the search/sort row into a single horizontal line.

- Move the stats `<div>` into the same row as the search `<Input>` + `<Select>`.
- Stats align left; search + sort align right (or vice-versa — whatever fits).
- Use `flex-wrap` with `gap-3` so it collapses gracefully on narrow viewports.
- Keep the existing stat pill styling (`bg-slate-50`, rounded-lg, icon + text).
- Remove the now-empty stats-only `<div>` wrapper.

### Files
- `src/components/tepilot/rewards-pipeline/AvailableDealsGrid.tsx` — restructure the two adjacent rows into one shared row.