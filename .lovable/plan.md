

## Fix Network Diagram: Fluid Layout + Panel-Responsive Sizing

### Problems
1. All geometry constants (gaps, widths) are hardcoded pixels — they don't adapt when the container resizes on panel collapse/expand
2. The grid can overflow or get cramped depending on available width
3. The `centered` prop is passed but not meaningfully used

### Solution — `DemoNetworkDiagram.tsx`

Make the layout **fluid** by deriving all horizontal positions from `dims.w`:

1. **Replace fixed constants with ratios** based on container width:
   - TX cards at ~12% from left
   - Engine center at ~35% 
   - Grid right edge fills remaining space with padding
   - Gaps and widths scale proportionally with `dims.w`

2. **Clamp minimum sizes** so elements don't shrink too small:
   - `TX_CARD_WIDTH`: `min(180, dims.w * 0.15)`
   - `ENGINE_WIDTH`: `min(210, dims.w * 0.18)`
   - `GRID_WIDTH`: `min(440, dims.w * 0.38)`
   - Gaps derived from remaining space

3. **Proportional 3-column layout**:
   ```text
   |--pad--|--TX--|----gap----|--ENGINE--|----gap----|--GRID--|--pad--|
   ```
   Each section gets a percentage of `dims.w`, ensuring balanced spacing at any width.

4. **Grid row compactness** — reduce `GRID_ROW_HEIGHT` slightly (110→100) and tighten padding so content fits cleanly without overflow.

5. **Node buttons** — use `min-w-0` and `truncate` on labels to prevent text overflow in narrower containers.

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx` — replace fixed geometry with fluid proportional layout

