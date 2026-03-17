

## Plan: Add Intermediate "Pillar" Layer to Network Diagram

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

**Current layout:** Engine → 6 output nodes (grouped visually in 3 sections)

**New layout:** Engine → 3 intermediate pillar nodes → each pillar fans out to 2 leaf nodes

### The 3 Pillars

| Pillar | Label | Leaf nodes |
|--------|-------|------------|
| **Profiling** | "What they have spent on" | Personalized UX, Bank-Wide Analytics |
| **Predictive** | "What they might spend next" | Consumer Rewards, Travel Experiences |
| **Phase** | "Where they are in life" | Life Event Detection, Wealth Management |

### Layout Changes

1. **Add a new column** between Engine (center) and the leaf nodes (right). Four columns total:
   - `colLeft` — transaction cards (unchanged)
   - `colCenter` — Ventus AI Engine (unchanged)
   - `colMid` — 3 pillar nodes (NEW), vertically centered, evenly spaced
   - `colRight` — 6 leaf nodes in 3 grouped sections (unchanged, shifts slightly right if needed)

2. **Pillar node rendering** — each is a rounded card (~150×60px) with:
   - Bold pillar name (e.g. "Profiling")
   - Subtitle text (e.g. "What they have spent on")
   - Colored left accent or icon
   - State-aware styling matching existing node pattern (idle/processing/ready)

3. **SVG lines update:**
   - Engine → 3 pillar nodes (replace current engine → 6 nodes lines)
   - Each pillar → its 2 leaf nodes (new short fan-out lines)
   - Animated dots follow same pattern as existing lines

4. **Readiness logic** — pillar node shows "ready" when its engine is ready; leaf nodes keep existing `nodeReadiness` behavior. Pillar nodes are not clickable (they're structural groupings).

5. **Column position math** — adjust `colRight` slightly and insert `colMid` at roughly 65% of width. The 3 pillars are vertically distributed to align with their corresponding section groups.

