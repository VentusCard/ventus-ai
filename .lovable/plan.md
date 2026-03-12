

## Make Engine Profile Dynamic (Post-Enrichment Data)

Currently `DemoEngineProfileView` builds its profile from static `DemoCustomer` data. It should instead incorporate the **enriched transactions** from the pipeline, making the profile reflect real AI-classified results.

### Changes

**1. `src/components/demo/DemoEngineProfileView.tsx`**
- Accept new optional props: `enrichedA?: EnrichedTransaction[]`, `enrichedB?: EnrichedTransaction[]`
- Update `buildProfile` to accept an optional `enrichedTxns` parameter
- When enriched data is available, compute spending summary, pillar breakdown, top merchants, and behavioral patterns **from the enriched transactions** (using `pillar`, `subcategory`, `normalized_merchant`, `amount`, `confidence`)
- When enriched data is not yet available, show a "Run enrichment first" placeholder instead of falling back to static data
- Add an `enrichment_metadata` section showing avg confidence, total classified count, enrichment timestamp

**2. `src/components/demo/DemoDetailOverlay.tsx`**
- Pass `enrichedA` and `enrichedB` through to `DemoEngineProfileView`

**3. `src/components/demo/DemoNetworkDiagram.tsx`**
- Only allow clicking the engine node when enrichment is complete (all nodes ready), or show a tooltip "Run enrichment first"

