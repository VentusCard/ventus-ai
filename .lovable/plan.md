# Keep signal families in the same horizontal positions at 3.3

## Goal
When moving from 3.2 to 3.3, the five signal families should only move up and shrink back to their original size — not shift sideways.

## Cause
At 3.2 the families are spread edge-to-edge across the card. At 3.3 they switch to five equal-width columns with each label pinned to the left of its column, so after the text edits ("SKU-level insights", "15+ Risk Patterns") they sit noticeably left of their 3.2 positions.

## Change
- Use the same edge-to-edge spread at 3.3 as at 3.2; only the vertical position and text/dot size change.
- Keep everything else unchanged: the question line, the animation timing, the card, the colors, and the copy.

## Technical details
- In `src/components/deckmo/DeckmoDeck.tsx` (LivingView), change the families container so both states use `flex justify-between`. The `questionsRevealed` branch keeps `top-4` / `translate-y-0` but drops `grid grid-cols-5 gap-x-6 max-xl:gap-x-3`.
- Check 3.2 → 3.3 at 1024×768, 1540×855, and 1920×1080: same horizontal positions, no overlap, no wrapping.
