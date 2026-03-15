
Goal: Make the Ventus AI Engine the first node that becomes interactable/visually “ready” (clickable + bordered + solid incoming lines), before any other node appears available.

What is currently causing the mismatch:
1. In `DemoNetworkDiagram.tsx`, engine clickability and border styling are tied to `allNodesReady` (all peripheral nodes), so engine appears available last.
2. Incoming lines to the engine are tied to `inputReady`, not engine readiness.
3. Peripheral nodes are always clickable even when not ready, which makes “something else available first” possible.

Implementation plan:

1. Update readiness booleans in `src/components/demo/DemoNetworkDiagram.tsx`
- Add:
  - `const engineReady = nodeReadiness.engine === "ready";`
  - `const engineProcessing = nodeReadiness.engine === "processing";`
- Keep peripheral readiness checks, but stop using `allNodesReady` for engine UI state.

2. Make engine button availability depend only on engine readiness
- Change engine button:
  - `disabled={!engineReady}`
  - `onClick` guard to `if (engineReady) onNodeClick("engine")`
  - title text to reflect engine-first behavior (`"Ventus AI Engine is still processing"` vs `"View deep customer profile"`).
- Change engine “ready” border/glow classes to use `engineReady` (not `allNodesReady`).

3. Make left→engine connector lines become solid when engine is ready
- For input lines:
  - `isReady` should be based on `engineReady`.
  - `isProcessingLine` should be based on `engineProcessing`.
- This ensures solid connection appears exactly when the engine is available first.

4. Prevent other nodes from being available before engine
- In each right-side node button:
  - Define `const canOpenNode = engineReady && state === "ready";`
  - Add `disabled={!canOpenNode}` and guard `onClick`.
  - Update cursor/opacity styles so non-openable nodes visibly look inactive.
- Status text behavior:
  - If `!engineReady`: show “Waiting for Engine…”
  - Else if node processing: “Processing…”
  - Else if ready: “✓ Data ready”
  - Else: neutral waiting text.

5. Keep hook sequencing as-is (no backend changes)
- `useDemoEnrichment.ts` already gates peripheral readiness behind engine readiness and sets engine ready first; no schema/backend work needed.
- Only UI interaction/visual gating needs adjustment.

Technical details (concise):
- Primary file: `src/components/demo/DemoNetworkDiagram.tsx`
- No database/auth/function changes.
- No route/page-level changes required.

Validation checklist:
1. Start enrichment.
2. Confirm engine gets border + becomes clickable first.
3. Confirm left→engine lines are solid when engine becomes ready.
4. Confirm right-side nodes are not clickable before engine is ready.
5. Confirm right-side nodes only become clickable once both conditions are met (engine ready + node ready).
