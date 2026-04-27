## Problem

When the user clicks "Semantic Enrichment", they briefly see the OLD split view (left transactions panel + right pill grid) before the `classify-transactions` edge function returns. Once enriched data arrives, the layout swaps to the full-screen enrichment table. The flash of the old layout is unwanted.

## Root cause

The `showEnrichmentFullScreen` flag in `ExecDemoPage.tsx` requires `enrichedTxs.length > 0`. While the edge function is still running, the flag is false, so the left panel renders and the IntelPanel falls back to the legacy pill grid (`chipsByPillarCategory` view in `ExecDemoIntelPanel.tsx` lines 712–800).

## Fix

Make the full-screen enrichment view the only view shown during the pre-synthesis hold phase — show a loading skeleton in the table area while waiting for the edge function instead of the legacy pill grid.

### 1. `src/pages/ExecDemoPage.tsx`
Drop the `enrichedTxs.length > 0` requirement so the left panel hides as soon as we enter `hold` (pre-synthesis):
```ts
const showEnrichmentFullScreen = phase === "hold" && !synthesisTriggered;
```

### 2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
In the table container (around line 710), replace the legacy pill-grid fallback with a lightweight loading skeleton when `enrichedTransactions` isn't ready yet AND we're in the pre-synthesis state (`!synthesisTriggered`). Keep the legacy pill grid as a fallback only for the post-synthesis collapsed view (where it's still used when `pillsExpanded` is toggled).

Logic:
- If `enrichedTransactions?.length > 0` → render `ExecDemoEnrichmentTable` (unchanged)
- Else if `!synthesisTriggered` → render a simple skeleton (header row + 6–8 shimmer rows matching the table layout) with a small "Enriching transactions..." label
- Else → keep existing legacy pill grid (unchanged, only relevant for synthesized state)

The skeleton uses the same column structure as `ExecDemoEnrichmentTable` so the layout doesn't jump when data arrives.

## Files

- `src/pages/ExecDemoPage.tsx` (1 line condition change)
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` (wrap the fallback branch with skeleton-vs-legacy logic)

No new components, no behavior change after enrichment completes or after "Behavioral Intelligence" is clicked.