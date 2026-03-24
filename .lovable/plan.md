

## Plan: Dynamic Centering When Impact Column Is Hidden

### Problem
The layout math always includes `gap4 + IMPACT_COL_WIDTH` in `totalContentWidth`, so even when the Impact column is invisible, the first 4 columns are offset to the left rather than centered.

### Solution
Compute whether any impact column is visible (any consumer node is `"ready"`), and conditionally exclude the impact column width from `totalContentWidth`. Add CSS transitions on all positioned elements so the diagram smoothly slides into its new centered position when the impact column appears.

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

1. **Derive `anyImpactVisible`** — `PILLAR_ROWS.some(p => nodeReadiness[p.consumerNode.id] === "ready")`

2. **Conditional `totalContentWidth`** — when `!anyImpactVisible`, exclude `gap4 + IMPACT_COL_WIDTH` from the sum. This shifts `offsetX` rightward, centering the 4-column layout.

3. **Add CSS transitions to all positioned elements** — TX cards, engine card, bank nodes, consumer nodes, impact cards, column headers, and SVG lines all use inline `left`/`top` styles. Add `transition: left 0.6s ease, opacity 0.5s ease` (or similar) so when `offsetX` changes, everything slides smoothly.

4. **SVG lines** — SVG paths are computed from the same X coordinates, so they'll update reactively. Wrap the SVG in a `<g>` with a CSS transition on transform, or simply let React re-render the paths (they'll snap — consider using a brief crossfade or keeping SVG transitions via `style={{ transition: 'd 0.6s ease' }}`).

### Single file modified
- `src/components/demo/DemoNetworkDiagram.tsx`

