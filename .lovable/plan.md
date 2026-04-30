## Goal
Two refinements to `/pricing` when **Pilot** is toggled on in Step 1:

1. **Step 1 — show a fixed pilot customer-size field next to the Pilot button.**
2. **Step 2 — collapse the per-row Pilot column into one merged cell** showing the total pilot fee spanning all module rows (instead of a value repeated on every row).

## Changes (all in `src/pages/Pricing.tsx`)

### 1. Step 1: Pilot customers field
When `pilotMode` is true, render a read-only/static field directly after the Pilot button showing `pilot.customers` (e.g. `100,000 pilot customers`). Styled as a soft emerald pill to match the pilot accent already used elsewhere. Value comes from the existing `pilot.customers` (configurable via Admin dialog), so no new state needed.

### 2. Step 2: Merge the Pilot column
Currently the "Pilot/yr" column renders `pilotPerModule` (flatFee ÷ moduleCount) on every row — visually noisy and arithmetically arbitrary. Replace with a single merged cell:

- Keep the column header `Pilot/yr` with subtitle `{customers} · all-in`.
- Remove the per-row pilot cell from the module `<li>` rows.
- Render ONE absolutely-positioned overlay cell spanning the full module list height in that column, vertically centered, displaying `formatCurrency(pilot.flatFee)` with the green check icon and a small `flat / yr · all modules` caption.

Implementation approach: wrap the `<ul>` of modules in a `relative` container. When `pilotMode` is on, render a sibling `<div>` positioned `absolute` over the pilot column (using the same 12-col grid math: `left` and `width` matching `col-span-1` at the pilot column's position) with `inset-y-0`, `flex items-center justify-end`, and a subtle left/right border to visually read as a merged cell.

Module rows keep their existing grid but the pilot col-span slot becomes empty (renders nothing) so the overlay sits cleanly on top without affecting row hover/click.

### Totals strip
No change — already shows a single Pilot total.

## Out of scope
- No changes to `pricingCatalog.ts`, Admin dialog, email/copy text builders, or PricingSummary.
- Pilot customer count remains admin-editable only (not editable from Step 1).
