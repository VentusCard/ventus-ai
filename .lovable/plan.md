

## Plan: Fix Diagram Formatting and Spacing

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### Problems identified

1. **Leaf node vertical spacing is inherited from old grouped-section layout** — uses `sectionPadTop: 28`, `sectionPadBottom: 12` creating large gaps between the 3 pillar groups of leaf nodes, as if invisible section boxes still exist.
2. **Column distribution is uneven** — large gap between pillars and leaf nodes vs. engine and pillars.
3. **Unused constants** (`SECTIONS`, `ALL_NODES`) left over from previous refactor.
4. **Container `scale(1.05)` can cause edge clipping** on smaller viewports.

### Changes

1. **Simplify leaf node vertical positioning** — Remove the section-based padding math. Instead, distribute all 6 leaf nodes evenly across the diagram height, with each pair of nodes visually close to its parent pillar. Use pillar Y positions as anchors: each pillar's two nodes are placed at `pillarY - offset` and `pillarY + offset` (e.g. offset ~30px), creating tight pairs.

2. **Rebalance column positions** — Adjust the 4 columns to be more evenly distributed:
   - `colLeft`: 8% (transaction cards)
   - `colCenter`: 30% (engine)
   - `colMid`: 55% (pillars)
   - `colRight`: 78% (leaf nodes)
   - Same proportional logic for `centered` mode

3. **Vertically center pillar nodes** — Distribute 3 pillars evenly across the container height with equal gaps, independent of section math. Engine vertically centered between them.

4. **Clean up dead code** — Remove `SECTIONS`, `ALL_NODES`, `sectionGap`, `sectionPadTop`, `sectionPadBottom`, `sectionContentHeight`, `totalSectionsHeight`, `sectionsStartY`, `getSectionTop`.

5. **Remove `scale(1.05)`** transform to prevent clipping — elements should be sized correctly without it.

6. **SVG path control points** — Update bezier curve control points to match new column positions for smoother curves (shorter horizontal distances between pillars and leaves).

### Result
A cleaner, evenly-spaced 4-column flow diagram where leaf nodes tightly pair under their parent pillar, columns are balanced, and no phantom section gaps exist.

