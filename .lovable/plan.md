

## Fix: ResultsTable Column Header/Body Mismatch

### Problem
The column headers and body cells are out of order in the Enrichment tab's results table. The **header** shows: `... Subcategory, Confidence, Source, Actions` but the **body** renders: `... Subcategory, Source, Confidence, Actions`. This causes the Source badge to appear under the Confidence header and vice versa.

### Fix
**File: `src/components/tepilot/ResultsTable.tsx`**

Swap the header order so Source comes before Confidence, matching the body:

- **Header** (lines 73-77): Move the conditional `Source` TableHead before `Confidence`
- Result: `... Subcategory, Source, Confidence, Actions` -- matching the body cell order exactly

This is a one-line swap in the header section. No other files need changes.

