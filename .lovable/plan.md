

## Hide Column Headers for Engine Node

The `DemoDetailOverlay` renders a "Column Headers" section (lines 132–147) showing customer names with avatar icons for all views. Since the `DemoEnrichmentTableView` (the "engine" node) already has its own `CustomerHeader` bars with names and stats, these top headers are redundant.

### Change — `src/components/demo/DemoDetailOverlay.tsx`

Conditionally hide the Column Headers section when `node === "engine"`:

- Wrap the grid div at lines 133–147 in a condition: only render when `node !== "engine"`

This is a one-line conditional — no other files need changes.

