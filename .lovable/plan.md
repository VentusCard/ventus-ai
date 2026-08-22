# Signal drawer: three tiles per row, slightly taller

Adjust the expanded signal family drawer in `SignalFamilyPanel.tsx`.

## Changes

- Grid becomes 3 columns at `lg` and above (2 columns on smaller widths); drop the 4-up breakpoint.
- With 6–8 signals this is 2–3 rows, so the drawer grows a bit taller — still no inner scrolling, content-sized.
- Restore slightly roomier tiles now that width allows it: `px-3 py-2.5`, `gap-2`, title back to 12.5px, count 14px, sparkline 56px wide.
- Keep the hover-revealed arrow (no "Open segment" label) so the metrics row stays clean.

No other behavior changes.
