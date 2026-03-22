

## Add Travel Detection to /demo Enrichment Pipeline

### Current State
- The demo runs `classify-transactions` but explicitly skips `travel-detection` (line 418: "no travel-detection — pass undefined for homeZip")
- The Travel overlay (`DemoTravelView`) uses **hardcoded** trip data from `DemoCustomer.trips` — not AI-detected trips
- Each `DemoCustomer` has a `zip` field available as `homeZip`
- The `travel` node readiness is gated on `local-experiences` completing, not on actual travel detection

### Plan

#### 1. Add travel-detection call after classification — `useDemoEnrichment.ts`
- In `maybeStartPhase2()`, after both classifications complete, call `travel-detection` edge function for both customers using their enriched transactions and `customer.zip` as `homeZip`
- Use `preFilterTravelCandidates()` (from `travelPreFilter.ts`) to reduce payload before sending to AI
- Parse SSE response and merge `trip_label` + `travel_context` back into `enrichedA`/`enrichedB`
- Gate `travel: "ready"` on **both** travel-detection AND local-experiences completing (currently only local-experiences)

#### 2. Pass travel-enriched transactions to Travel + Rewards views
- The enriched transactions already flow through to `DemoDetailOverlay` → `DemoTravelView` and `DemoRewardsView`
- Update `DemoTravelView` to display **AI-detected trips** (from `trip_label`/`travel_context` on enriched transactions) alongside the existing hardcoded trip cards
- Group enriched transactions by `trip_label` to build detected trip summaries (destination, date range, transaction count, total spend)

#### 3. Update enrichment flow timeline
- Phase 2 now includes: lifestyle signals, coaching tips, deal personalization, AND travel detection — all in parallel
- Travel node readiness = `local-experiences` done AND `travel-detection` done for both customers

### Files Modified
- `src/hooks/useDemoEnrichment.ts` — add travel-detection calls in `maybeStartPhase2`, gate travel node on both sources
- `src/components/demo/DemoTravelView.tsx` — add AI-detected trip section from enriched transaction data
- `src/components/demo/DemoDetailOverlay.tsx` — pass enriched transactions to TravelView (already passed, just ensure used)

