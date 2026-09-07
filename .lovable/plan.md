# Compact LTV Lift Sliver Layout

## Goal
Redesign the collapsed "Anticipated LTV Lift" sliver above Key Features so it uses space more efficiently, switching from a centered, vertically padded row to a dense horizontal row.

## What you'll see
- Collapsed sliver becomes a single compact row:
  - Trending-up icon on the left.
  - "Anticipated LTV Lift" title aligned left, vertically centered.
  - Prominent value pill on the right (e.g. "+$48 / customer / yr").
  - Chevron on the far right.
- Row height reduced to ~44–48px and internal padding/gaps tightened.
- Expanded state still pushes Key Features down and shows the same supporting lines.
- No-selection muted state preserved.
- Customer-change collapse reset preserved.

## Technical details
- File: `src/components/tepilot/insights/personalization/LtvLiftSliver.tsx`
  - Replace the centered title wrapper with a left-aligned title in the main flex row.
  - Move the value pill and chevron into the same row; remove extra vertical centering wrappers.
  - Reduce collapsed height class from `h-[12.5%] min-h-[64px]` to `h-[12.5%] min-h-[44px]` (or `min-h-[48px]`).
  - Reduce button padding from `px-3.5` to `px-3` and remove `flex flex-col justify-center` in favor of `flex items-center`.
  - Shrink icon chip to `w-6 h-6` with `w-3.5 h-3.5` icon if needed for density.
  - Keep `expanded` state, transition, reset effect, and expanded detail grid unchanged.
- Optional: tighten the gap between the sliver and Key Features in `SurfaceFeaturePanel.tsx` from `gap-4` to `gap-3` if the visual rhythm needs it.

## Acceptance criteria
- All three personalization tabs show the denser LTV Lift sliver.
- Collapsed row is a single horizontal line with title left and value right.
- Expansion still reveals supporting lines and pushes Key Features down.
- No-selection state remains muted/grayscale.
- Typecheck and production build pass; no console errors on `/bankdemo` personalization tabs.
