# Rebalance Section 7 Spacing and Proportions

## Goal
Make section 7 feel composed as one presentation slide rather than three disconnected columns, while preserving its content and rotating recommendation cards.

## Changes
- Scope the layout refinement to section 7 so sections 5 and 6 remain unchanged.
- Reduce the phone from its current near-full-height treatment to a better-proportioned presentation size, restoring comfortable space beneath the header and above the footer.
- Rebalance the three-column grid around the smaller phone:
  - give the narrative column more usable width,
  - narrow the oversized center track to match the phone,
  - bring the beat cards closer to the phone,
  - use even, deliberate gaps between all three areas.
- Vertically align the narrative, phone, and active beat card around the same visual center.
- Tighten the narrative block’s internal spacing so the heading, description, and value block read as one unit.
- Refine the phone’s internal proportions for this presentation size: preserve the financial snapshot, give the rotating recommendation card the dominant share of the screen, and keep the bottom navigation clear.
- Keep all copy, colors, card contents, rotation timing, phone aspect ratio, and deck navigation unchanged.

## Technical details
- Add a section-7 layout/sizing variant to `PhoneScene` and `ExactPhone` rather than changing shared sizing globally.
- Use responsive height constraints for the 1691×1011 presentation viewport and the existing 1540×855 fallback.
- Keep the existing strict light-theme tokens and current component styling.

## Validation
- Verify beats 7.1–7.3 at 1691×1011 and 1540×855.
- Confirm balanced top/bottom breathing room, no overlap with presentation chrome, and no clipped phone content.
- Confirm all three recommendation cards still rotate every four seconds and pause on interaction.
- Confirm sections 5 and 6 are visually unchanged and the build remains clean.
