# Match filters sidebar height to the left column

The right-hand **Audience filters** panel in Section 1 currently shrinks to fit its own controls (it has `self-start`). The left column (search + selected-product detail) can be taller, so the two columns end at different heights and the sidebar looks short.

Make the sidebar always equal the height of the left column, and have its filter list collapse/scroll inside that fixed height when needed.

## Change

In `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`:

- On the `<aside>` filters panel:
  - Remove `self-start` so the grid's default `stretch` alignment matches the left column's height.
  - Switch it to a flex column (`flex flex-col`) so the inner filter list can take the remaining space.
- Wrap the five filter groups (age / income / gender / region / household) in an inner `<div>` with `flex-1 overflow-y-auto pr-1 space-y-4` so they scroll inside the panel when the left column is short.
- Keep the header ("Audience filters" + Reset) pinned at the top and the "Applied to the addressable audience in Section 2." footnote pinned at the bottom.

No changes to filter logic, controls, defaults, or any other section.
