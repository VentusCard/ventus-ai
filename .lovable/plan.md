

## Make Enrichment Table Use Full Space with All Columns Visible

### Problem
The current layout uses `grid-cols-2` with side-by-side tables, but 9 columns per table get squeezed horizontally. The `max-h-[500px]` also wastes vertical space in the overlay.

### Fix — Stack Vertically, Full Width

Change from side-by-side to **stacked vertically** (one customer table on top, one below), each taking full width so all 9 columns display comfortably. Remove the fixed `max-h-[500px]` constraint and let the outer overlay's `overflow-y-auto` handle scrolling.

### Changes in `src/components/demo/DemoEnrichmentTableView.tsx`

1. Change outer container from `grid grid-cols-2 gap-5` → `flex flex-col gap-6`
2. Remove `max-h-[500px]` from each table's scroll wrapper — let tables show all rows (the overlay content area already scrolls)
3. Add compact padding to `TableHead` and `TableCell` (`px-2`) so columns fit cleanly at full width
4. Keep the `overflow-x-auto` on the table wrapper as a safety net

Single file, ~4 line changes.

