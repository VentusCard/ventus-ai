

## Plan: Skip Travel Detection, Use `local-experiences` for Demo Travel Node

### Problem

The `travel-detection` edge function is the slowest call (~10-15s) in the demo pipeline. The `DemoTravelView` already renders from **hardcoded** `customer.trips` data — the travel-detection results aren't displayed. The only reason it runs is to flip the travel node to "ready."

Meanwhile, the demo travel view could be enhanced by calling the much faster `local-experiences` edge function (Gemini Flash, ~2-3s) to generate real local venue suggestions for the customer's detected trip destinations.

### Solution

1. **Skip `travel-detection`** entirely in the demo flow — pass no `homeZip` to `useSSEEnrichment` so it skips the slow travel call
2. **Call `local-experiences`** instead — for each customer's first trip destination, fetch real local venue suggestions
3. **Mark travel node ready** once local-experiences responses arrive (or immediately with a short delay if we want visual polish)

### Changes

**`src/hooks/useDemoEnrichment.ts`**:
- Pass `undefined` as `homeZip` to `enrichA.startEnrichment()` and `enrichB.startEnrichment()` so travel-detection is skipped
- Remove the `Promise.all([promiseA, promiseB])` travel-ready block
- Instead, fire `local-experiences` calls for each customer's first trip destination at t=0 (no dependency on classification)
- Store the local-experiences results and mark `travel: "ready"` when done
- Expose the local experiences data in the return value

**`src/components/demo/DemoTravelView.tsx`**:
- Accept optional `localExperiences` prop with the AI-generated venue suggestions
- Render a "Local Experiences" section under each customer's hardcoded trip cards showing the real venue names from `local-experiences`

### Expected Impact
- Eliminates the 10-15s travel-detection call
- Replaces it with a ~2-3s local-experiences call
- Travel node reaches "ready" 8-12s faster
- Adds real AI-generated local content to the travel view

### Files
- `src/hooks/useDemoEnrichment.ts` — skip travel-detection, fire local-experiences instead
- `src/components/demo/DemoTravelView.tsx` — display local experiences results
- `src/components/demo/DemoDetailOverlay.tsx` — pass local experiences data through to travel view

