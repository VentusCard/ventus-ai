
Goal
- Fix the collapse behavior so the network diagram is truly centered and animates smoothly (without jitter or line/node desync).

Deep-dive findings (from current code + replay)
1. The “centered” layout is mathematically biased to the right.
- Current collapsed positions use `colLeft=20%`, `colCenter=50%`, `colRight=80%`.
- But rendered boxes are asymmetric around those anchors:
  - Left side uses `left: colLeft - 40` (Tx cards width 160)
  - Right side uses `left: colRight - 58` (section width 210, right extent = `+152`)
- This creates a constant visual center offset of +56px to the right.
- That is why it still looks off-center even when `colCenter` is 50%.

2. Resize tracking is incomplete.
- `dims` is updated only on `window.resize` and `centered` toggle.
- Panel collapse/expand is a flex width transition, not a window resize.
- So layout snapshots can be stale during transition, causing jumps/flicker.

3. Animation is unsynchronized.
- Boxes animate via `left/top` CSS transitions.
- SVG paths do not animate `d` in sync.
- Result: cards/nodes glide while lines snap, which feels “worse”.

Implementation plan
1. Refactor layout math in `DemoNetworkDiagram.tsx` to explicit geometry constants
- Introduce named constants for:
  - tx card width and anchor offset
  - engine width
  - section width and anchor offset
- Compute a `visualBias` from those constants and apply compensating shift when `centered=true`, so the whole composition center matches container center (not just engine center).
- Keep expanded-state proportions unchanged unless needed for overflow clamps.

2. Replace current size measurement with `ResizeObserver`
- Observe the diagram container (or svg parent) and update `dims` on every width change during panel animation.
- Remove reliance on `window.resize` for this behavior.
- This gives continuous position updates during collapse/expand.

3. Synchronize movement by removing positional CSS transitions
- Remove `left/top` transition from Tx cards, engine, section containers.
- Let animation come from panel width transition + continuous `ResizeObserver` updates.
- Keep non-positional transitions (hover/shadow/opacity) intact.

4. Keep line and node positions derived from same live coordinates
- Ensure SVG paths and absolute elements use the exact same computed x/y values each render.
- This prevents temporary mismatch between connectors and nodes.

5. Add responsive guards
- Clamp centered layout so left/right groups never clip on narrower widths.
- Keep existing vertical layout logic unchanged.

Technical details
- File to update: `src/components/demo/DemoNetworkDiagram.tsx`
- Key code changes:
  - swap `window.addEventListener("resize")` for `ResizeObserver`
  - replace hardcoded centered percentages with geometry-based centered compensation
  - remove `posTransition` usage on `left/top`
- No backend or database changes.

Validation checklist
1. At current viewport (1289x841), collapse panel:
- Diagram center aligns with container center (visually and by bounds).
- No jump at collapse start/end.
- Lines stay attached to moving nodes throughout transition.

2. Expand panel back:
- Returns to original open-panel layout cleanly.
- No snap-back/flicker.

3. Repeat collapse/expand quickly several times:
- Stable behavior, no drift.
