# Move range/compare chips onto the Intelligence Database header row

## Goal
On `/bankdemo` → **Intelligence Database**, place the "last 30 days" range chip and the "Compare" chip on the same horizontal line as the "Customer Intelligence Database" title and "Every signal Ventus extracts across the portfolio" subtitle, so the top of the view is more compact.

## Current state
- `AnalystDashboardView.tsx` renders the title/subtitle in one flex row, then `DashboardToolbar` on its own full-width row below it.
- `DashboardToolbar.tsx` contains the range chip, compare chip, and a "Last refreshed" label.

## Changes
1. **Header layout in `AnalystDashboardView.tsx`**
   - Keep the left side as icon + "Customer Intelligence Database" + "Every signal Ventus extracts across the portfolio".
   - Move the range and compare chips to the right side of the same row.
   - Remove the separate `DashboardToolbar` block below the header.

2. **`DashboardToolbar.tsx` cleanup**
   - Keep the range and compare popover logic unchanged.
   - Remove the "Last refreshed" element so the toolbar is just the two chips and can sit cleanly in the header row.
   - Simplify the root wrapper to a simple inline flex container (`items-center gap-2`).

## Verification
- Open `/bankdemo` → **Intelligence Database**.
- Confirm the range chip and compare chip appear on the same baseline as the page title.
- Confirm both popovers still open and update the dashboard state.
- Confirm no visual regression on smaller viewports (chips should wrap or stay right-aligned without overlapping the title).
