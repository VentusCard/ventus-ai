# Prevent subcategory chips from stacking and tilting row height

In the executive demo enrichment table, the Subcategories cell currently uses `flex flex-wrap`, so when a transaction has multiple subcategory chips (e.g. Hawaiian vacation transactions) they wrap onto multiple lines and inflate the row height. Switch to a single-line, clipped layout.

## Change in `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` (lines 274–284)

Replace the wrapping container with a non-wrapping, overflow-clipped row:
- `flex flex-wrap gap-0.5` → `flex flex-nowrap gap-0.5 overflow-hidden whitespace-nowrap`
- Each chip gains `shrink-0 whitespace-nowrap` so it stays full-size and gets cut off cleanly at the cell's right edge instead of compressing or wrapping.
- Add `title={subs.join(", ")}` on the wrapper so the full list remains visible on hover.

Result: subcategory chips render on a single line. Anything beyond the column width is clipped, keeping every row at the standard height regardless of how many subcategories a transaction has.
