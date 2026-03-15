

# Make Engine Ready State Match Actual Content Readiness

## Problem
The engine card currently fires its "ready" state on a fixed 1.5s timer (`setTimeout`, line 138 in `useDemoEnrichment.ts`), regardless of whether the enrichment data is actually available. The user wants the engine to show "ready" only when the content is truly ready.

## Change

**File: `src/hooks/useDemoEnrichment.ts`**

Remove the fixed 1.5s `setTimeout` that sets `engine: "ready"` (lines 137-140). Instead, set `engine: "ready"` inside `maybeStartPhase2()` (around line 181) when both classifications have completed and `inputReady` is set to `true`. This is the point where actual enrichment data is available.

The peripheral node gating logic already works correctly — queued peripheral updates flush when the engine becomes ready. So moving the engine ready trigger to `maybeStartPhase2` will naturally cause all pending peripheral nodes to flush at the right time too.

No changes to `DemoNetworkDiagram.tsx` — the visual styling already handles idle/processing/ready states correctly.

