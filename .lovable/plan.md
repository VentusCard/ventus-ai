

## Show enrichment fields as "—" before analysis runs

### Problem
The tooltip currently shows fully populated enrichment data (Pillar, Category, Tier, etc.) even before "Semantic Enrichment" is clicked, because `signalMap` is built immediately from local MCC data.

### Solution
Add an `enriched` boolean prop to `TxRow` and `ExecDemoLeftPanel`. When `enriched` is false, the "Ventus Semantic Enrichment" section still renders but every field shows "—" in muted styling instead of real values.

### Changes

**`src/components/exec-demo/ExecDemoLeftPanel.tsx`**

1. Add `enriched?: boolean` prop to both `TxRow` and the main component
2. In the tooltip (lines 125-149), when `!enriched`:
   - Keep MCC row as-is (always shows real data)
   - Render "Ventus Semantic Enrichment:" header as-is
   - Replace Pillar/Category/Sub values with "—" in `text-slate-500`
   - Replace Tier/Frequency/Confidence values with "—" in `text-slate-500`
3. Pass `enriched` through to all `TxRow` usages in the idle, scroll, cardScan, and hold phases

**`src/pages/ExecDemoPage.tsx`**

Pass `enriched={phase === "hold" || phase === "cardCycle"}` (or whatever flag indicates enrichment is complete) to `ExecDemoLeftPanel`.

