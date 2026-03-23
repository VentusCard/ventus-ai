
Fix the diagram by re-centering the entire 4-column composition in the available right-panel space instead of pinning it to the left.

**What I’ll change**
1. **Center the full diagram block even when the side panel is open**
   - Replace the non-centered `offsetX = pad` behavior with a center-anchored calculation.
   - Use a clamped centered offset so the layout stays visually centered but never touches the edges.

2. **Add a compact geometry mode for the open-panel width**
   - The current min widths are still too large for the ~790px canvas, so the whole block stays bulky and left-heavy.
   - Reduce non-collapsed widths for:
     - TX cards
     - engine card
     - bank column
     - consumer column
   - Keep the larger sizing for collapsed/centered mode.

3. **Rebalance the horizontal budget after centering**
   - Keep `gap1` tighter than the other gaps.
   - Give slightly more space between engine → bank and bank → consumer.
   - Let all connection paths inherit the new coordinates from the updated geometry.

4. **Preserve vertical height**
   - No taller rows.
   - No added vertical padding.
   - Only horizontal placement and compact-width tuning.

**Technical details**
- File: `src/components/demo/DemoNetworkDiagram.tsx`
- Main issue: the previous change improved spacing *inside* the block, but the whole block is still anchored left via `offsetX`.
- Key update:
  - compute `totalContentWidth`
  - compute a centered `offsetX` for both modes
  - introduce smaller non-centered width clamps so the centered result has real breathing room on both sides
- Result:
  - the diagram sits optically centered in the right canvas
  - bank/consumer columns stop feeling jammed against the left side
  - collapsed mode keeps its existing larger presentation
