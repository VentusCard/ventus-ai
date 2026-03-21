

## Findings: How Category & Subcategories Display in /tepilot and /demo

### What's Already Working
Both `ResultsTable.tsx` (/tepilot) and `DemoEnrichmentTableView.tsx` (/demo engine view) already have the **Category** and **Subcategories** columns added. Data flows from the edge function through `useSSEEnrichment` → UI, so new fields render automatically when live classification runs.

### Bug Found: Travel Detection Desyncs `subcategory` and `subcategories`

In `src/hooks/useSSEEnrichment.ts` (lines 285-290), when travel detection reclassifies a transaction, it updates `subcategory` but **not** `subcategories`:

```typescript
updated[idx].subcategory = travelUpdate.reclassified_subcategory;
// subcategories array is never updated!
```

This means after travel detection, the Subcategories column (which reads `tx.subcategories`) shows stale data while `tx.subcategory` has the correct travel value.

**Fix**: Update both fields together:
```typescript
if (travelUpdate.reclassified_subcategory) {
  updated[idx].subcategory = travelUpdate.reclassified_subcategory;
  updated[idx].subcategories = [travelUpdate.reclassified_subcategory];
} else if (travelUpdate.reclassified_pillar) {
  updated[idx].subcategory = travelUpdate.reclassified_pillar;
  updated[idx].subcategories = [travelUpdate.reclassified_pillar];
}
```

### Demo Sub-Views Using `t.subcategory` (Backward Compat — OK)

These files still reference `.subcategory` (the deprecated singular field), which works fine since it maps to `subcategories[0]`:

| File | Usage | Status |
|---|---|---|
| `DemoEngagementView.tsx` | Groups spending by `t.subcategory` | ✅ Works (uses first label) |
| `DemoEngineProfileView.tsx` | Aggregates by `t.subcategory` | ✅ Works |
| `DemoPillarCodeView.tsx` | Shows in JSON payload | ✅ Works |
| `DemoRewardsView.tsx` | Shows `deal.subcategory` | ✅ Works (different type) |

No changes needed for backward compat — the singular field is preserved.

### Recommended Fix
One file change: `src/hooks/useSSEEnrichment.ts` — sync `subcategories` array when travel detection updates `subcategory`.

