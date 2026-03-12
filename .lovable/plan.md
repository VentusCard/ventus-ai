

## Plan: Animated Enrichment Flow with Dotted-to-Solid Line Transitions

### Concept

When the user hits "Enrich", all SVG connector lines start **dotted**. As each edge function completes, the corresponding lines transition to **solid** with a smooth animation — giving a live visual of data flowing through the pipeline.

### Pipeline Mapping (Edge Functions → Nodes)

```text
classify-transactions  ──► input lines (left cards → engine) go solid
                        ──► "analytics" node line goes solid (pillars come from classification)
travel-detection       ──► "travel" node line goes solid
analyze-lifestyle-signals ──► "wealth" node line goes solid (life events)
                          ──► "engagement" node line goes solid (lifestyle signals)
deal-personalization   ──► "rewards" node line goes solid
```

### State Model

Track per-node readiness in `DemoPage.tsx`:

```typescript
type NodeReadiness = Record<DemoNodeType, "idle" | "processing" | "ready">;
```

- **idle**: dotted line, muted node
- **processing**: dotted line with animated traveling dot (current behavior)
- **ready**: solid line, full opacity, brief glow transition

### Files to Edit

**1. `src/hooks/useSSEEnrichment.ts`** — No changes needed (already exposes `currentPhase` and `enrichedTransactions`)

**2. `src/pages/DemoPage.tsx`**
- Add `nodeReadiness` state: `Record<DemoNodeType, "idle" | "processing" | "ready">`
- On enrich click: set all nodes to `"processing"`
- After `classify-transactions` completes (enrichA/B `currentPhase` transitions past classification): set `analytics` → `"ready"`
- Fire three parallel calls post-classification: `analyze-lifestyle-signals`, `travel-detection`, `deal-personalization`
- As each resolves, flip its corresponding node(s) to `"ready"`
- Pass `nodeReadiness` to `DemoNetworkDiagram`

**3. New: `src/hooks/useDemoEnrichment.ts`**
- Wraps `useSSEEnrichment` for Phase 1 (classify-transactions)
- Adds Phase 2: fires `analyze-lifestyle-signals`, `travel-detection`, `deal-personalization` in parallel via direct fetch calls
- Exposes: `nodeReadiness`, `isProcessing`, `enrichedData` (classification results + lifestyle signals + travel + deals), `startEnrichment(customer)`
- Caches results per customer ID

**4. `src/components/demo/DemoNetworkDiagram.tsx`**
- Accept new prop: `nodeReadiness: Record<DemoNodeType, "idle" | "processing" | "ready">`
- **Input lines** (left cards → engine):
  - `idle`: `strokeDasharray="6 4"`, low opacity, no traveling dot
  - `processing`: `strokeDasharray="6 4"`, traveling dot animates
  - `ready`: `strokeDasharray` removed (solid), higher opacity, CSS transition on stroke-dasharray
- **Output lines** (engine → right nodes):
  - Same three states per node
  - When `ready`: line transitions to solid, opacity increases to 0.7, node border gets a brief glow (`boxShadow` pulse)
- Add SVG `<style>` block for `transition: stroke-dasharray 0.6s ease, opacity 0.4s ease`
- Input lines become solid when classification completes (all output nodes at least processing)

**5. `src/components/demo/DemoCustomerPanel.tsx`**
- Add more phase dots: Classify → Travel → Lifestyle → Deals → Complete
- Map to the actual edge function phases

### Visual Behavior Timeline

```text
t=0   User clicks "Enrich Both"
      → All lines become dotted + traveling dots start
      → Engine node gets subtle pulse border

t=5s  classify-transactions completes
      → Input lines (cards → engine) transition to SOLID
      → "analytics" output line transitions to SOLID
      → analytics node gets green check glow
      → Phase 2 fires: travel-detection, analyze-lifestyle-signals, deal-personalization

t=8s  travel-detection completes
      → "travel" output line → SOLID

t=10s analyze-lifestyle-signals completes
      → "wealth" + "engagement" output lines → SOLID

t=12s deal-personalization completes
      → "rewards" output line → SOLID
      → All lines solid, processing complete
```

### Edge Function Calls (Phase 2)

Use direct `fetch` calls (not SSE) since `analyze-lifestyle-signals` and `deal-personalization` return standard JSON:

```typescript
// All three fire in parallel after classification
const [lifestyleRes, travelRes, dealsRes] = await Promise.allSettled([
  fetch(`${supabaseUrl}/functions/v1/analyze-lifestyle-signals`, { ... }),
  fetch(`${supabaseUrl}/functions/v1/travel-detection`, { ... }),  // SSE
  fetch(`${supabaseUrl}/functions/v1/deal-personalization`, { ... }),
]);
```

Each resolved promise flips its node to `"ready"`.

### Files Summary
- Create `src/hooks/useDemoEnrichment.ts` — orchestrates all 4 edge functions, exposes `nodeReadiness`
- Edit `src/pages/DemoPage.tsx` — use new hook, pass readiness state down
- Edit `src/components/demo/DemoNetworkDiagram.tsx` — dotted/solid line transitions based on `nodeReadiness`
- Edit `src/components/demo/DemoCustomerPanel.tsx` — more granular phase dots

