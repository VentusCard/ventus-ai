

# Engine Node Must Be Ready Before Peripheral Nodes

## Problem
Currently, peripheral nodes (rewards, travel, analytics, etc.) can become "ready" before the Ventus AI Engine. Conceptually, the Engine is the central brain — it should light up first, signaling that data has been processed, and only then should the individual module nodes activate.

## Solution — `src/hooks/useDemoEnrichment.ts`

1. **Remove the "engine waits for all peripherals" logic** from `setNodeReady`. The engine should no longer depend on peripheral nodes.

2. **Set engine to "ready" early** — after a short delay (~1.5s) from enrichment start, independent of API results. This represents the engine "ingesting" data.

3. **Gate peripheral nodes behind engine readiness** — modify `setNodeReady` so that when a peripheral node tries to go "ready", it checks if the engine is already ready. If not, queue the update and apply it once the engine flips to ready.

   Concretely: maintain a `pendingReadyRef` (a ref holding queued node updates). In `setNodeReady`, if `engine !== "ready"`, store the updates in the ref. When the engine timeout fires and sets `engine: "ready"`, also flush all pending peripheral updates.

4. **Timeline**:
   - t=0: All nodes → "processing"
   - t≈1.5s: Engine → "ready" (plus any peripherals that already resolved)
   - t>1.5s: Remaining peripherals light up as their API calls resolve

This ensures the Engine always appears first, and no peripheral node can visually beat it.

