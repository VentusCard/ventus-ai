# Simplify the 5 signal-family cards

Update each of the 5 cards in Section 2 of `ExclusionFunnelSection.tsx` so they're solid-color tiles with just the icon and family name — no signal count, no population number.

## Visual changes per card

- **Background:** solid family color (e.g. Life Event → `bg-amber-500`, Behavioral → `bg-blue-500`, Financial → `bg-emerald-500`, Demographic → `bg-violet-500`, Risk → `bg-rose-500`). Remove the white background and left-border accent.
- **Text:** white label, white icon (no colored tile behind the icon).
- **Remove:** the `"N signals · ±NNK"` line.
- **Keep:** the small circular `+`/`−` button (top-right) and the chevron — both restyled to white/translucent so they read on the solid background.
- **Disabled state:** card drops to ~40% opacity; the +/− button flips to an outlined white style.
- **Expanded state:** ring stays (white ring on solid card).

## Files to edit

- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — adjust card markup only.
- `src/lib/productCatalogExtras.ts` — add a `solid` color class per family to `FAMILY_META` (e.g. `bg-amber-500`, `bg-emerald-500`) so the component pulls from the same palette source.

No changes to the popover content, the expanded panel below the row, the funnel math, or the footer.
