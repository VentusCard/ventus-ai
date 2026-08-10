# Customers tab — side-by-side detail panel

Today, selecting a customer replaces the results table with the full profile. Instead, keep the results visible and open the profile in a panel docked to the right.

## Behavior

- No selection: results table spans the full width (unchanged), as does the guided empty state.
- On row click: layout splits into results (left) + customer detail (right, ~420px, sticky while scrolling).
- Selected row stays highlighted so the banker keeps their place in the list.
- Panel header gets a close (X) control; the "Back to results" link is no longer needed.
- Sorting, filtering, and search stay live while the panel is open; if the selected customer drops out of the filtered set, the panel stays open until closed.
- Type-ahead selection from the search bar opens the same right panel.
- On narrower widths the panel stacks below the table so nothing gets squeezed.

## Layout

```text
┌ KPI strip ─────────────────────────────────────────────┐
├ Search bar + chips ────────────────────────────────────┤
├ Results table (flexible) ──────┬ Customer detail ──────┤
│  row  row  [row selected]      │  header + actions     │
│  row  row                      │  5 signal families    │
└────────────────────────────────┴───────────────────────┘
```

## Technical notes

- `CustomersDirectoryView.tsx`: wrap results + detail in a `grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-3` container instead of the current either/or branch; keep the empty state full width.
- `CustomerDetailPanel.tsx`: reflow for the narrower column — header block becomes single-column (next actions below the profile facts instead of beside it), signal cards become one per row, back link swapped for an X button; make the wrapper `xl:sticky xl:top-3 xl:max-h-[calc(100vh-6rem)] overflow-y-auto`.
- `CustomerResultsTable.tsx`: accept an optional `selectedId` and apply a light blue row highlight plus a left accent border.
- Strict light theme preserved; no data or filtering-logic changes.
