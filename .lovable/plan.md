

## Fix: Input connector line invisible after enrichment

### Root Cause
After extensive code review, the input connector (customer → engine) renders correctly in the DOM, but uses `stroke="url(#lineGradSolid)"` (an SVG gradient reference) while every other working connector in the diagram uses a **direct color string** like `stroke={pillar.color}` (e.g. `"#3b82f6"`). SVG gradient references with `url(#...)` can silently fail to render under certain conditions (gradient bounding box, re-render timing, or transform context issues). This is the key difference between the working connectors and the broken one.

### Changes in `src/components/demo/DemoNetworkDiagram.tsx`

**1. Replace gradient stroke with a direct color** (lines 192-199)
- Change `stroke={isReady ? "url(#lineGradSolid)" : "url(#lineGrad)"}` to `stroke="#6366f1"` (indigo, a blend of the blue-to-purple the gradient was trying to achieve)
- Keep all other properties identical to the other connectors: `strokeWidth={isReady ? 2.5 : 1.5}`, `opacity={isReady ? 0.7 : 0.2}`, `strokeDasharray={isReady ? "none" : "6 4"}`

**2. Add a flowing particle on ready state** (matching engine→bank connectors)
- The engine→bank connectors show a subtle flowing particle when `pillarReady` (lines 230-232). Add the same for the input connector when ready, so the connection feels alive and matches the rest of the diagram.

This makes the input connector use the exact same rendering approach as every other visible connector in the diagram — direct color, no gradient references.

