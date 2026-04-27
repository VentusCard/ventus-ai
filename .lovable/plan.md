## Goal

After clicking "Behavioral Intelligence: Ready" and then expanding the rolled-up pills via the chevron, the enrichment table should NOT appear. Only the legacy pill grid should be shown for the expanded post-synthesis view.

## Root cause

In `src/components/exec-demo/ExecDemoIntelPanel.tsx` (line 717), the render branch shows the enrichment table whenever `enrichedTransactions` is populated — regardless of whether synthesis has been triggered. So once the user clicks Behavioral Intelligence and later expands the pills, the table still wins over the pill grid.

## Fix

One-line change: gate the enrichment-table branch on `!synthesisTriggered` so it only shows during the pre-synthesis hold phase. After synthesis, expanding pills falls through to the legacy pill-grid branch (the existing `else` already handles that path).

```tsx
// Before
{enrichedTransactions && enrichedTransactions.length > 0 ? (
  <ExecDemoEnrichmentTable transactions={enrichedTransactions} flush={fullWidthEnrichment} />
) : !synthesisTriggered ? (
  /* skeleton */
) : (
  /* legacy pill grid */
)}

// After
{!synthesisTriggered && enrichedTransactions && enrichedTransactions.length > 0 ? (
  <ExecDemoEnrichmentTable transactions={enrichedTransactions} flush={fullWidthEnrichment} />
) : !synthesisTriggered ? (
  /* skeleton (unchanged) */
) : (
  /* legacy pill grid (unchanged) */
)}
```

No other behavior changes — the pre-synthesis full-screen enrichment view, skeleton loader, and Behavioral Intelligence button flow stay exactly as they are.

## Files

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` (1 line)