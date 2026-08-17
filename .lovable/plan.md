# Automated Flows: flatten signal list and move toggle right

## What changes

Refine the expanded flow UI so signals read as one continuous, scannable list instead of family-section blocks.

1. **Remove family section dividers** — drop the "Behavioral · 3 signals" headers and per-family "Turn all on/off" controls. Signals are still tagged by family, but they render as a flat list.
2. **Inline family badge** — each `SignalRow` shows its family badge inside the row, next to the signal label/evidence, so the family label is visible without section headers.
3. **Move toggle to the right** — the on/off switch moves from the left edge to the right side of the row, beside the audience number and chevron.
4. **Share horizontal space** — label + evidence + family badge flex together on the left; audience + toggle + chevron stay right-aligned. Truncate label/evidence before they crowd the right-hand controls.

## Files changed

- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
  - Flatten `families.map(...)` into a single signal list.
  - Update `SignalRow` layout: family badge inline, toggle on the right.
  - Remove `toggleFamily` helper and per-family section markup.

## Not changed

- Signal expansion logic, weights, audience math, and session state in `flowSignalFamilies.ts` and `ProductAutomatedFlowsView.tsx` remain the same.
- Hyper-personalization detail panel behavior stays identical.
