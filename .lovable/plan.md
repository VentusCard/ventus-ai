
Fixing this needs a real geometry rewrite, not another percentage tweak.

What I found
- The previous changes did apply, but the diagram is still visually wrong in the screenshot:
  - the whole composition is shifted to the right
  - the pillar → leaf gap is much larger than the other column gaps
  - there is too much empty vertical space
  - the engine card is too narrow for the 3 capability cards
- The root problem is the layout math in `src/components/demo/DemoNetworkDiagram.tsx`:
  - `colLeft`, `colCenter`, `colMid`, and `colRight` are not using the same coordinate model
  - the right column is positioned by its left edge, while engine/pillars are positioned from their centers
  - collapsed-mode centering does not account for the true visual width of the tx cards on the left and the larger leaf cards on the right
  - vertical spacing is tied too directly to total container height (`dims.h * 0.28`), which creates oversized gaps on tall screens

Plan
1. Replace the current column math with a true “content frame”
   - Compute the full diagram bounds from:
     - left edge of tx cards
     - center-based engine/pillar cards
     - right edge of leaf cards
   - Center that entire frame inside the available panel
   - Use one consistent model: all major nodes get center X positions, then derive left/right edges from widths

2. Rebalance the 4 columns using visual spacing, not raw percentages
   - Keep the narrative order:
     `Transactions → Engine → 3 Ps → 6 outputs`
   - Reduce the pillar → leaf gap substantially
   - Slightly reduce the tx → engine gap
   - Keep the right column inside the composition instead of pinning it too far outward

3. Redesign the vertical layout as a controlled band
   - Stop scaling pillar spacing directly from full viewport height
   - Create a centered vertical content area with fixed top/bottom breathing room
   - Distribute the 3 pillars evenly inside that band
   - Keep each pair of leaf nodes tightly anchored to its parent pillar

4. Resize the engine card so the internal 3-card stack actually fits
   - Increase engine width
   - Keep the current 3 capability cards, but give them more horizontal room
   - Reduce awkward wrapping and improve internal padding balance

5. Recalculate all SVG connector paths from the new geometry
   - Input → engine
   - Engine → pillars
   - Pillars → leaf nodes
   - Match each path to actual card edges so the lines and cards stay synchronized

6. Clean up leftover dead layout code
   - Remove unused geometry artifacts like `ALL_NODES` / temporary flattening if no longer needed
   - Keep only one source of truth for node widths, heights, centers, and path anchors

Technical details
- I would refactor the component around explicit layout values such as:
  - `contentLeft`, `contentRight`, `contentWidth`
  - `txCenterX`, `engineCenterX`, `pillarCenterX`, `leafCenterX`
  - `contentTop`, `contentBottom`, `pillarY[]`, `leafY[]`
- Leaf nodes should be rendered from `leafCenterX - LEAF_NODE_WIDTH / 2`, not from an arbitrary `colRight` left edge
- Centered mode should use a visual-bias correction based on actual card extents, so collapsing the left panel does not make the whole diagram feel off-balance
- Vertical spacing should use a clamped band so the layout remains stable at presentation sizes like the current `1578×853`

Expected result
- The diagram will feel truly centered when the side panel is collapsed
- Horizontal gaps will read as intentional and balanced
- The 3 Ps will sit closer to the outputs they power
- The engine will feel like the visual anchor instead of a small box floating in whitespace
- The overall composition will look presentation-ready instead of mathematically “distributed”

Implementation focus
- Only `src/components/demo/DemoNetworkDiagram.tsx` should need layout changes for this pass
- I would preserve the current interaction logic and only rewrite the geometry / spacing system
