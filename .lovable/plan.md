

## Plan: Parallelize All Edge Functions

### Problem

Currently the flow is sequential in two phases:
1. **Phase 1**: `classify-transactions` for A + B (parallel) **+ travel-detection** for A + B (sequential within each) — takes ~10-15s
2. **Phase 2**: `analyze-lifestyle-signals` + `deal-personalization` — only starts **after** both Phase 1 fully complete (including travel)

Lifestyle signals and deal personalization don't need travel results — they only need classified transactions. But `useSSEEnrichment.startEnrichment()` bundles classify + travel into one awaited promise, so Phase 2 is blocked waiting for travel to finish.

### Solution

Restructure `useDemoEnrichment` to fire **all 4 edge functions** as soon as their dependencies are met:

```text
t=0   classify A + classify B (parallel)
t=5s  classification done →
        ├─ travel-detection A + B (parallel)     ← needs classified txns
        ├─ analyze-lifestyle-signals (parallel)   ← needs classified txns
        └─ deal-personalization (parallel)        ← needs customer data only
      All 3 fire simultaneously, not sequentially
```

This cuts ~5-8s off the total time since lifestyle + deals run **alongside** travel instead of **after** it.

### Changes

**`src/hooks/useDemoEnrichment.ts`** — Restructure `startEnrichment`:

1. Call `enrichA.startEnrichment()` and `enrichB.startEnrichment()` — but **don't await** their full completion (which includes travel)
2. Instead, split the flow: call `callClassifyTransactions` directly (extracted from useSSEEnrichment or duplicated as a simple fetch), then immediately fire all downstream functions in parallel
3. Alternatively (simpler): keep `useSSEEnrichment` as-is but fire Phase 2 **without waiting for Phase 1 to fully resolve** — use a callback/ref pattern:
   - After calling `enrichA.startEnrichment()` and `enrichB.startEnrichment()`, don't `Promise.all` them before Phase 2
   - Instead, fire lifestyle + deals immediately using the **raw parsed transactions** (pre-classification) since those edge functions do their own AI analysis anyway
   - Travel detection continues in background via useSSEEnrichment

**Recommended approach** — keep it simple:

- `deal-personalization` doesn't need classified transactions at all — it uses customer profile + deals data. Fire it immediately at t=0.
- `analyze-lifestyle-signals` benefits from classified pillars but can work with raw transactions. Fire it at t=0 with raw data OR wait only for classification (not travel).
- Refactor `startEnrichment` to:
  1. Parse CSVs
  2. Fire **all 5 calls simultaneously**: classifyA, classifyB, lifestyle, deals (travel stays inside useSSEEnrichment)
  3. As each resolves, flip its node to ready
  4. Analytics node waits for classification; travel waits for useSSEEnrichment; wealth/engagement wait for lifestyle; rewards waits for deals

### Files Modified
- `src/hooks/useDemoEnrichment.ts` — restructure to fire lifestyle + deals in parallel with classification instead of after it

