

## Vertically Stacked Enrichment Tables with Fixed Headers

### What Changes
**File: `src/components/demo/DemoEnrichmentTableView.tsx`**

Switch from `grid-cols-2` (side-by-side) to a vertical stack layout where each customer's table occupies ~half the available height, each independently scrollable with sticky column headers.

1. **Layout**: Replace `grid grid-cols-2 gap-4` with `flex flex-col gap-4 h-full`
2. **Each customer block**: Gets `flex-1 min-h-0 flex flex-col` so it takes half the vertical space
3. **Table wrapper**: Gets `flex-1 overflow-y-auto overflow-x-auto` for independent scrolling within each half
4. **Sticky headers**: Already have `sticky top-0` — just need the scroll container to be the per-customer div (not the parent overlay)
5. **Customer name label**: Add a small colored header bar above each table (blue for A, emerald for B) with the customer name + stats, kept outside the scroll area so it stays visible

This gives full column width for all 12 columns and lets each table scroll independently.

