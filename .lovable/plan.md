# Section 3 diagram positioning and connector correction

## Goal
Raise the complete section 3 visualization substantially while keeping the customer circle, side cards, signal-family card, and arrows as one stable composition.

## Changes
- Move the complete diagram group upward by roughly 48px from its current position, leaving the title and subtitle unchanged.
- Replace the current independently translated grid/card layout with one shared positioning wrapper so the center circle and lower card move together.
- Remove the height-dependent negative-margin connector calibration that is causing the overlap.
- Anchor the downward connector between two explicit points:
  - start behind the lower edge of the customer circle;
  - end with a small clear gap above the signal-family card.
- Keep the glowing dot and downward arrow animation, but constrain both to the connector track so neither enters the circle nor overlaps the card.
- Preserve the existing side-arrow animations, card dimensions, copy, and 3.2/3.3 reveal behavior.

## Validation
- Check beats 3.2 and 3.3 at the current 1691×1011 viewport and at 1920×1080.
- Confirm the full composition is visibly higher, the connector remains hidden behind the circle, and the arrowhead stops cleanly above the lower card.
- Confirm the animated dot travels only along the visible connector and the page remains free of clipping or overlap.
