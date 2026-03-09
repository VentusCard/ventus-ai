
## Plan: Stacked Comparison Preview Table

### What's changing
Currently, when 2 datasets are selected, the preview tab renders two separate `PreviewTable` components side-by-side (grid layout). The request is to merge both into **one table** with all rows stacked, with a new **"User"** column showing the customer name (e.g. "Dataset 4" or "Customer A").

### How it works
The stacking happens purely at the render level — no type changes needed. In `TePilot.tsx` (lines ~1010–1053), I'll replace the `grid-cols-2` dual-table layout with a single unified table that:

1. Tags each `parsedTransaction` with `_userId = selectedCompA?.demographics?.name || "Customer A"` 
2. Tags each `parsedTransactionsB` item with `_userId = selectedCompB?.demographics?.name || "Customer B"`
3. Merges them: `[...taggedA, ...taggedB]` 
4. Passes the merged array to a **modified `PreviewTable`** that shows a colour-coded **User** column as the first column

### Changes needed

**1. `src/components/tepilot/PreviewTable.tsx`**
- Add optional `comparisonMode?: boolean` prop
- When `comparisonMode` is true, render a "User" column (first column)
- Each transaction will have an extra `_userId` property (typed as `any` / intersection or just read via `(t as any)._userId`)
- Color-code: blue badge for Customer A, green badge for Customer B (detect by checking if `_userId` matches the first transaction's `_userId`)

**2. `src/pages/TePilot.tsx` (lines 1010–1053, the preview tab comparison block)**
- Replace the `grid-cols-2` layout with:
  ```
  const mergedPreview = [
    ...parsedTransactions.map(t => ({ ...t, _userId: nameA })),
    ...parsedTransactionsB.map(t => ({ ...t, _userId: nameB })),
  ]
  ```
- Pass `mergedPreview` to a single `<PreviewTable transactions={mergedPreview} comparisonMode={true} />`
- Keep the "Enrich Both & Compare" button below as-is

### Appearance
- Single table with all rows, sorted by their original order (A first, then B)
- First column: **User** — shows a colour-coded badge (blue = Customer A, green = Customer B)
- The summary stats (Total, Date Range) reflect the combined dataset
- No other behaviour changes

### Files changed
- `src/components/tepilot/PreviewTable.tsx` — add `comparisonMode` prop + User column
- `src/pages/TePilot.tsx` — replace dual `PreviewTable` with merged single call
