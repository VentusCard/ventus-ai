

## Fix Jittery Pillar Movement on Panel Expand/Collapse

### Problem

The pillar buttons have `transition-all duration-300` in their className. When the side panel opens/closes, the container resizes, `dims` state updates, and all `left`/`top` positions recalculate. The HTML nodes animate their positions smoothly via CSS transition, but the SVG connector lines redraw instantly — causing a visible desync where nodes slide left/right while lines snap.

### Fix

Replace `transition-all duration-300` on all absolutely-positioned nodes (pillars, engine, leaf nodes) with transitions scoped to **non-positional properties only** (opacity, box-shadow, border-color). This way, when the container resizes, both SVG paths and HTML nodes reposition instantly and in sync — no weird left-then-right bounce.

### Changes in `src/components/demo/DemoNetworkDiagram.tsx`

1. **Pillar buttons (line 324)**: Change `transition-all duration-300` → `transition-colors transition-shadow duration-300`
2. **Engine button (line ~270)**: Change `transition-shadow transition-opacity duration-300` → `transition-[box-shadow,opacity,border-color] duration-300` (already scoped, just verify no `transition-all`)
3. **Leaf node buttons (line ~375)**: Change `transition-shadow transition-opacity duration-300` → same scoped transition (verify)

Single file, ~3 class string edits.

