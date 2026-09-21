# Fix slide 3 arrow placement (The Complete Picture)

## Problem

In `LivingView` (`src/components/deckmo/DeckmoDeck.tsx:228`):

- The left and right `ChevronRight` arrows are centered in their feeder lanes (`left-1/2 top-1/2 -translate-x-1/2`), so they float mid-line instead of at the tip of the line where it meets the customer circle.
- The vertical connector that draws down from the customer circle to the signal-family card (beat 2) is a bare 1px line with no arrowhead, so it doesn't read as "flowing into" the card.

## Changes (`src/components/deckmo/DeckmoDeck.tsx` only)

1. **Side arrows at the line tips**
   - Left (blue) feeder: move the `ChevronRight` from lane center to the right end of the line, just before the customer rings (`right-0`, vertically centered, pointing right/inward).
   - Right (gold) feeder: move the rotated `ChevronRight` to the left end of the line (`left-0`, vertically centered, pointing left/inward).
   - Offset each by a few px so the chevron tip kisses the outer breathing ring without overlapping it; keep the animated signal dots passing beneath.

2. **Downward connector arrowhead**
   - Add a small downward chevron/triangle (`ChevronDown`, deck-blue) at the bottom end of the vertical connector, attached to the top edge of the synthesis card.
   - It appears with the same beat-2 timing as the connector (`scale-y` reveal, delay-150), so the line now visibly "lands" on the card.

3. **Unchanged**
   - Copy, colors, animation timings, beats, and all other slides.
   - Reduced-motion: arrows static at the tips, connector and arrowhead fully visible.

## Verification

- `bunx tsgo --noEmit` clean; build OK.
- Playwright at 1540×855 and 1024×768 on slide 3, beats 1 and 2: chevrons sit at the line tips beside the circle, connector ends in an arrowhead touching the card, no overlap or clipping.
