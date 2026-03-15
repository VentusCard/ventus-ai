# Demo Enrichment Flow - Edge Function Execution Order

## Phase 1: Immediate Parallel Execution (t=0)

These fire **simultaneously** when user clicks "Enrich":

```
1. classify-transactions (Customer A)
2. classify-transactions (Customer B)  
3. local-experiences (Customer A - 3 parallel calls: dining, entertainment, shopping)
4. local-experiences (Customer B - 3 parallel calls: dining, entertainment, shopping)
```

**Total concurrent requests:** 8 edge function calls

---

## Phase 2: After Both Classifications Complete

Triggered by `maybeStartPhase2()` when BOTH classification streams finish:

```
5. deal-personalization (Customer A)
6. deal-personalization (Customer B)
7. analyze-lifestyle-signals (Customer A)
8. analyze-lifestyle-signals (Customer B)
```

**Total concurrent requests:** 4 edge function calls

---

## Timeline Visualization

```
t=0ms
├── classify-transactions (A) ──────────┐
├── classify-transactions (B) ──────────┤ ~8-10s
├── local-experiences (A × 3) ─────┐    │
└── local-experiences (B × 3) ─────┘    │ ~4-5s
                                        │
t=~10s (both classifications done)      │
├── Engine node becomes ready ◄─────────┘
├── deal-personalization (A) ──────┐
├── deal-personalization (B) ──────┤ ~2-3s
├── analyze-lifestyle-signals (A) ─┤
└── analyze-lifestyle-signals (B) ─┘ ~5-7s
                                    │
t=~17s (all enrichment complete)    │
└── All peripheral nodes ready ◄────┘
```

---

## Node Readiness Gating

**Engine Node:** Ready when both `classify-transactions` complete  
**Analytics Node:** Ready with Engine (no separate processing)  
**Rewards Node:** Ready when `deal-personalization` completes  
**Travel Node:** Ready when all `local-experiences` complete  
**Life Events, Wealth, Engagement Nodes:** Ready when both `analyze-lifestyle-signals` complete

**Critical:** Peripheral nodes (Rewards, Travel, etc.) remain in "Waiting for Engine..." state until Engine becomes ready, even if their data is available earlier.
