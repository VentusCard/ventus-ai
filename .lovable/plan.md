## Issue

In the executive demo (`/demo`), the rolled-up lifestyle pills in the Intelligence Panel are not explicitly sorted by total spend. Today their display order comes from whatever order the LLM (`synthesize-persona`) emits them in — which often correlates loosely with transaction count rather than dollar value. The result feels inconsistent and de-emphasizes high-dollar lifestyle behaviors.

## Fix

Sort `rollupStats` by `totalSpend` descending in `src/components/exec-demo/ExecDemoIntelPanel.tsx` so the highest-spend lifestyle rollups always render first.

### Change

In `ExecDemoIntelPanel.tsx` (~line 226), update the `rollupStats` memo:

```ts
const rollupStats = useMemo(() => {
  return rollups
    .filter(r => (r.totalCount ?? 0) > 0)
    .slice()
    .sort((a, b) => (b.totalSpend ?? 0) - (a.totalSpend ?? 0));
}, [rollups]);
```

This is the single source feeding:
- The pill row (`rollupPills` mapped from `rollupStats`)
- Auto-selection of the first rollup on the Next-Offer tab
- The lifestyle entries in `availableSignals` for the Relationship tab
- The `pillarRollups` prop passed to `NextProductRationale`

All downstream consumers will inherit the new spend-ranked order automatically.

### Out of scope

- Life-event pills and risk pills keep their existing ordering (life events by detection order, risks by a fixed `ORDER` array). Only the lifestyle/behavioral rollups change.
- No edge-function changes needed; sorting stays client-side so it doesn't depend on a re-synthesis.