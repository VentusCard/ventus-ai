## Goal
Make each row in the Automated Flows list clickable to reveal the flow's signals inline.

## Changes

### `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`

- Add `expandedId` state (string | null) in `ProductAutomatedFlowsView`. Only one row expanded at a time.
- Wrap each `FlowRow` in a container that:
  - Renders the row as a button (cursor-pointer, click toggles expand).
  - Adds a `ChevronDown` icon (rotates 180° when expanded) at the right edge, before the Switch.
  - The Switch and its surrounding area get `onClick={(e) => e.stopPropagation()}` so toggling Active/Paused does NOT expand the row.
- When expanded, render a panel below the row inside the same bordered container, showing:
  - Section label "Signals Ventus is detecting" (sparkles icon).
  - The existing signal list (bullet + label + evidence) from the old card layout.
- Light theme, slate-200 border, slate-50 expanded background, smooth chevron rotation.

No data/state/behavior changes beyond expand/collapse.

## Validation
- Clicking a row expands it and collapses any previously expanded row.
- Clicking the Switch toggles Active/Paused without expanding/collapsing.
- Signals render correctly with label + evidence.