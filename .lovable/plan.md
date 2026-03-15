

# Fix: Engine Node Should Be "Ready" Only When Profile Is Viewable

## Problem
The `engine` node starts as `"ready"` in `INITIAL_READINESS`, which is misleading. It should only show as "ready" (with the blue border) when all enrichment is complete and the deep customer profile can actually be viewed.

## Changes — `src/hooks/useDemoEnrichment.ts`

1. **Change `INITIAL_READINESS`**: Set `engine: "idle"` instead of `"ready"`.

2. **In `startEnrichment`**: Set `engine` to `"processing"` along with all other nodes at the start.

3. **Set `engine` to `"ready"` last**: After all other nodes (analytics, travel, rewards, engagement, wealth, lifeEvents) have resolved, set engine to `"ready"`. This can be done by watching for all other nodes becoming ready — add a check after each node-ready setter. When all 6 non-engine nodes are ready, set `engine: "ready"`.

   Practically: add a helper that checks if the 6 peripheral nodes are all ready and, if so, flips engine to ready. Call this helper after every `setNodeReadiness` that marks a node ready.

## Result
- Engine stays gray/processing during enrichment
- Engine gets the blue border + glow only when all modules are done and the profile JSON is viewable
- No change needed in `DemoNetworkDiagram.tsx` — it already uses `allNodesReady` for the clickable state

