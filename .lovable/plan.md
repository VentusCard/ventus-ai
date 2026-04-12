

## Fire All Edge Functions ASAP — Pipeline Optimization

### Current Flow
```text
t=0 ─── classify-transactions (SSE stream, ~8-10s)
     ├── local-experiences × 3 (parallel, ~4-5s)
     │
     └── [waits for classification to finish]
         ├── deal-personalization (~2-3s)
         ├── analyze-lifestyle-signals (~5-7s)
         └── generate-financial-tip (~3-4s)

detect-risk-transactions: NOT fired until user manually clicks button
```

### Optimized Flow
```text
t=0 ─── classify-transactions (SSE stream, ~8-10s)
     ├── local-experiences × 3 (parallel, ~4-5s)
     │
     └── [classification complete → fire ALL Phase 2 in parallel]
         ├── deal-personalization (~2-3s)
         ├── analyze-lifestyle-signals (~5-7s)
         ├── generate-financial-tip (~3-4s)
         └── detect-risk-transactions (~3-4s)  ← NEW: pre-fired
```

All four Phase 2 functions already depend on classified/enriched data (pillar, spending_tier, etc.), so they genuinely cannot fire before classification. The only real optimization is **pre-firing `detect-risk-transactions`** during Phase 2 instead of waiting for user interaction.

### Technical Changes

**1. `src/hooks/useDemoEnrichment.ts`**
- Add `riskFlags` state to hold pre-computed risk analysis results
- Fire `detect-risk-transactions` in parallel with the other Phase 2 functions inside `maybeStartPhase2`
- Expose `riskFlags` in the return object

**2. `src/components/demo/ConsumerAIChatView.tsx`**
- Accept `riskFlags` as a prop (pre-computed data)
- When user clicks "Risk factors & alerts", use cached `riskFlags` instantly instead of calling the edge function
- Fall back to live call if `riskFlags` is null (e.g., enrichment still running)

**3. `supabase/config.toml`**
- Add missing `generate-financial-tip` function config entry with `verify_jwt = false`

### Result
Risk analysis results are ready the moment the user opens the chatbot, making the "Risk factors & alerts" button feel instant instead of waiting 3-4 seconds for an API call.

