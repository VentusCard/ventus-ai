# Living View: title on one line, diagram moved up

## Goal

On beats 3.2/3.3 the title "Ventus AI: Holistic AI Customer Intelligence" wraps to two lines and the diagram sits low. Make the title a single line and pull the whole diagram up.

## Change

`src/components/deckmo/DeckmoDeck.tsx` — LivingView scene only (other slides unchanged):

1. `Header` gets an optional `wide` prop. When set, the header renders full width (`max-w-[1560px]`) instead of `max-w-[1180px]`, so the 44-character title fits on one line at its current large size (about 1400px of text at ~55px font, which fits the 1476px content width at 1540×855). Only LivingView passes `wide`.
2. Reduce the gap above the diagram: `mt-8` between header and grid becomes `mt-4` (and `mt-3` at max-height 800px), and section top padding for this scene shrinks from `py-8` toward `pt-4`, so the entire diagram (cards, circle, insight card) moves up.

## Verification

- Playwright at 1540×855 and 1920×1080: screenshot shows the title on one line and the diagram sitting higher with no clipping of the connected arrow or insight card.
- Other slides keep their two-line-safe narrow header.
- Build clean.
