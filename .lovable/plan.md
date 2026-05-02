## Goal

In the /demo "Ventus AI Engine — Enrichment Output" table, make each Pillar badge (e.g. "Pets") clickable so all transactions in that pillar are **brought to the top of the same table** and visually highlighted — matching the in-table pill-click pattern used elsewhere. Click again (or click the active pillar) to clear the filter and restore original order.

## Behavior

- Click pillar badge → that pillar's rows sort to the top, remaining rows stay below in original order.
- Active pillar badge gets a ring/outline so it's clear what's selected.
- A small "Showing: Pets ✕" chip appears above the table; clicking ✕ (or re-clicking the active badge) clears.
- Table stays in place, scrolls to top automatically on selection.
- No modal — purely in-table reordering, like other pill click mechanisms in the app.

## Changes

### `src/components/demo/DemoEnrichmentTableView.tsx`
- Add `useState<string | null>` for `activePillar` and `useMemo` to produce a sorted list: matching pillar rows first (original order preserved), then the rest.
- Wrap the Pillar `<Badge>` in a `<button>` that toggles `activePillar`. Add `cursor-pointer`, hover ring, and a stronger ring/border when `tx.pillar === activePillar`.
- Above `<CustomerTable>` (inside the customer block), conditionally render a small filter chip: pillar-colored pill with name + count + ✕ button.
- On `activePillar` change, scroll the table's overflow container to top via a `ref`.
- Optionally dim non-matching rows (e.g. `opacity-50`) when a pillar is active, to mirror existing pill-filter affordances.

### No other files touched
Data already flows in via `enriched` prop; pillar colors come from `PILLAR_COLORS` (already imported).

## Technical Notes
- Stable sort: `[...enriched].sort((a,b) => (b.pillar===active?1:0) - (a.pillar===active?1:0))` — JS sort is stable in modern engines, preserving original order within each group.
- Use `useRef<HTMLDivElement>` on the scrollable wrapper; `useEffect` resets `scrollTop = 0` when `activePillar` changes.
- Keep all existing column widths, typography, and light-theme styling untouched.

## Out of Scope
- No URL state, no modal, no changes to other tables (tepilot, exec demo).
