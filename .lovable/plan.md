

## Pass Life Events to Deal Generation Edge Function

### What changes
After life events are detected, pass them to `generate-next-offers` so the AI generates a second set of deals tailored to each detected life event (e.g., "Moving to New Home" → furniture/moving deals).

### Flow change
Currently `fireNextOffers` and `fireLifeEventDetection` run in parallel. We'll add a second call: once life events resolve, fire a supplemental offers request that appends life-event-based deal groups to the existing `generatedOffers`.

### Changes

**1. `src/pages/ExecDemoPage.tsx`**
- Add a new function `fireLifeEventOffers(events: LifeEvent[])` that calls `generate-next-offers` with a `lifeEvents` payload instead of `persona.pillarRollups`
- Call `fireLifeEventOffers` from `fireLifeEventDetection` after events are detected (line ~367, alongside `fireProductCards`)
- Append the returned `rollupOffers` to the existing `generatedOffers` state (merge, don't replace)

**2. `supabase/functions/generate-next-offers/index.ts`**
- Accept an optional `lifeEvents` array in the request body
- When `lifeEvents` is present, add a second section to the prompt instructing the AI to generate one deal group per life event (5 deals each), using the event name as the rollup label and the evidence merchants as spending context
- The output shape remains the same (`rollupOffers` array) — life event groups just get appended

### Prompt addition (edge function)
When life events are provided, append to the user prompt:
```
LIFE EVENT CLUSTERS (generate 5 deals per event):
1. "Moving to New Home" — evidence: IKEA, Home Depot, U-Haul
2. "Career Advancement" — evidence: LinkedIn Premium, Brooks Brothers
```
The system prompt gets a new rule: "If LIFE EVENT CLUSTERS are provided, generate an additional rollup group for each event with deals that support that life transition."

### UI impact
The `NextOfferRationale` and `GeneratedOffersPhoneView` components already iterate over `RollupOfferGroup[]` — additional groups from life events will render automatically with no component changes needed.

