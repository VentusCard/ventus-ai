

## Make Engine + 3 Pillars Clickable with Live Data Views

### Revised Node → Data Mapping

Based on your feedback, here is the holistic mapping that makes narrative sense:

**Ventus AI Engine** → `classify-transactions` response
Show the raw enriched transaction data — the actual AI classification output with pillars, subcategories, confidence scores, spending tiers, and purchase frequencies. This is what the engine *does*: it takes raw transactions and returns rich, structured intelligence.

**Profiling** ("What they have spent on") → Pillar summary derived from classified data
Show a structured breakdown: each pillar with its total spend, transaction count, average confidence, top subcategories, dominant spending tier, and frequency distribution. This is a live aggregation of the classification output — no separate API call needed, it is computed client-side from the enriched transactions.

**Predictive** ("What they might spend next") → `deal-personalization` + `local-experiences` responses
Show the deal personalization request/response (profile → personalized offers) alongside the travel local-experiences results. Both are forward-looking: "based on what we know, here is what we recommend next." This combines rewards and travel intelligence into one predictive view.

**Phase** ("Where they are in life") → `analyze-lifestyle-signals` response
Show the lifestyle signals request/response — the detected life events with confidence scores, transaction evidence, talking points, and financial projections. This is the life-stage detection engine.

### Implementation

**1. Extend `DemoNodeType`** — add `"profiling" | "predictive" | "phase"` to the union type.

**2. Make pillar nodes clickable** in `DemoNetworkDiagram.tsx` — change the pillar `<div>` elements to `<button>` elements, clickable once engine is ready. Add hover effects and "Click to explore" hint.

**3. Capture raw API payloads** in `useDemoEnrichment.ts`:
- Store the `classify-transactions` response (already have `enrichedA`/`enrichedB`)
- Store the `deal-personalization` request + response for both customers
- Store the `local-experiences` responses
- Store the `analyze-lifestyle-signals` request + response (already have `detectedEventA`/`detectedEventB`, but also capture the full request payload)

Expose these as a new `apiPayloads` object from the hook.

**4. Create `DemoPillarCodeView.tsx`** — a new component with a dark-themed JSON viewer showing:
- **Engine view**: sample of enriched transactions with all fields highlighted
- **Profiling view**: aggregated pillar breakdown table with live stats
- **Predictive view**: deal-personalization payload + local-experiences data side by side
- **Phase view**: lifestyle signals request → detected events response

Each view uses a split-pane layout (Request | Response) with syntax-highlighted, collapsible JSON and a "Live Data" badge.

**5. Wire into overlay** — update `DemoDetailOverlay.tsx` with the 3 new pillar types in `NODE_TITLES` and `renderContent()`. Update `DemoPage.tsx` to pass `apiPayloads` and add pillar types to navigation order.

### Files changed
- `src/components/demo/DemoNetworkDiagram.tsx` — extend type, make pillars clickable
- `src/hooks/useDemoEnrichment.ts` — capture and expose raw API payloads
- `src/components/demo/DemoPillarCodeView.tsx` — new component (4 view modes)
- `src/components/demo/DemoDetailOverlay.tsx` — add pillar + engine rendering with code views
- `src/pages/DemoPage.tsx` — pass payloads, update navigation

