
I rechecked the actual code paths, and I agree the previous diagnosis was too narrow.

What I rechecked
- In `src/components/demo/DemoNetworkDiagram.tsx`, the customer → enrichment connector is always rendered inside the first SVG group (`lines 183-199`).
- In `src/hooks/useDemoEnrichment.ts`, `nodeReadiness.engine` is explicitly set to `"ready"` early in phase 2 (`setNodeReady({ engine: "ready", ... })`), so this is not a missing-state / missing-render bug.
- The only thing that changes when the engine becomes ready is:
  - stroke switches from `url(#lineGrad)` to `url(#lineGradSolid)`
  - dash switches from `"6 4"` to `"none"`
  - width/opacity change
  - the animated processing dot disappears

Revised diagnosis
- The real problem is not that the path stops rendering.
- The problem is that the “finished” state still relies on the same subtle background connector treatment, and once the moving dot disappears there is no strong dedicated completion indicator left.
- So retrying opacity/width alone is unlikely to solve it reliably.

Implementation plan
1. Replace the single-state connector with a two-layer connector
- Keep a faint background/base path for idle + processing.
- Add a separate “completed connection” overlay path that only renders when `engineReady` is true.

2. Make the completed connector visually distinct
- Use a solid, high-contrast stroke instead of the current gradient-only finish state.
- Add `strokeLinecap="round"` so the line reads as intentional, not clipped.
- Add endpoint dots/caps at the customer exit and engine entry so the connection is obvious even without animation.

3. Move the completed connector out of the generic background treatment
- Keep the base connector in the background SVG.
- Render the completed overlay in its own SVG/group above the background lines but still below interactive overlays/cards.
- This avoids the “processing looks active, ready looks absent” problem.

4. Slightly adjust the anchor points
- Inset the start/end a few pixels so the finished connector is visibly attached rather than visually dying at the card edges.
- Keep the current layout math; only adjust the connector anchors, not the whole grid.

5. Preserve the current processing animation
- Keep the moving particle during processing.
- When `engineReady` becomes true, remove the particle and show the dedicated completed connector instead of just changing the same path’s styling.

Files to update
- `src/components/demo/DemoNetworkDiagram.tsx`

Technical details
```text
Current:
base path handles idle + processing + ready

Proposed:
base path = idle/processing track
processing dot = processing only
completion path + endpoint dots = ready only
```

Validation
- Enrich a customer and confirm the connector is clearly visible after the engine flips to ready and after the full flow completes.
- Check both states:
  - panel collapsed (`centered = true`)
  - panel open (`centered = false`)
- Confirm the finished connector still looks correct after the diagram shifts for the Impact column.
