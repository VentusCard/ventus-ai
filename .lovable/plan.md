

# Center and Animate Network Diagram on Panel Collapse

## Problem
When the left panel collapses, the network diagram columns shift but aren't truly centered in the now-full-width container. The transition also isn't animated.

## Plan

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

1. **Fix centering math** — When `centered=true`, distribute the three columns evenly across the full width. Approximate layout:
   - `colLeft`: `dims.w * 0.15` → `dims.w * 0.18` (keep similar)
   - `colCenter`: `dims.w * 0.46` → `dims.w * 0.44` (shift slightly left to visually center the flow)  
   - `colRight`: `dims.w * 0.75` → `dims.w * 0.72` (pull right column inward)

2. **Animate the transition** — Add CSS `transition` to all absolutely-positioned elements (TX cards, engine button, section containers) so they smoothly glide when `centered` toggles:
   - Add `transition: left 0.5s ease, top 0.5s ease` via inline styles on each positioned element
   - SVG lines will re-render on state change; add a wrapper `<g>` with CSS transition on opacity for a subtle crossfade

3. **SVG re-measurement** — Trigger a dims recalculation when `centered` changes by adding `centered` to the `useEffect` dependency array, so the SVG paths update to match new positions.

**Changes**: Single file edit — `src/components/demo/DemoNetworkDiagram.tsx`

