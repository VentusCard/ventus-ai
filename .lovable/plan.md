## Goal
Convert the "Automated Flows" tab on /bankdemo from a multi-column card grid to a single-column list of compact horizontal rows.

## Changes

### `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`

Replace the `FlowCard` component with a `FlowRow` component:

- **Layout**: single full-width row per flow, flex layout with no vertical stacking inside the row.
- **Left section**: product icon (small, 32px), name (text-sm font-semibold), category pill (same color logic).
- **Middle section**: signals count ("N signals") + positioning text truncated to one line.
- **Right section**: formatted audience number, status toggle + "Active" / "Paused" badge.
- **Hover**: subtle background change (slate-50).
- **Grid**: change `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` to just `grid-cols-1`.

Keep all existing data, state, filtering, and toggle behavior unchanged. Keep `TabHeader` and category filter pills exactly as they are.

## Validation
- Rows stack vertically at all breakpoints.
- Category filter still works; toggling a row updates its status badge in place.
- No layout overflow at the demo viewport width (>=1024px).