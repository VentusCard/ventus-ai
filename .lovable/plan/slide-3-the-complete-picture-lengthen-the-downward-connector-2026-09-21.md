# Slide 3 (THE COMPLETE PICTURE): lengthen the downward connector line

## Change
In `src/components/deckmo/DeckmoDeck.tsx` (LivingView, beat 2 synthesis connector):

- Increase the vertical line from `h-7` (28px) to `h-16` (64px) so it reads as a clear downward flow from the customer circle to the five-families card.
- On compact screens (`max-height:800px`), increase from `h-5` to `h-10` (40px) so it stays proportionally longer without overflowing.
- Keep the animation exactly as-is: `origin-top` scale-y grow (`delay-150 duration-500`), the ChevronDown arrowhead fade (`delay-300 duration-500`), the card reveal (`delay-500`), and the motion-reduce fallbacks. No timing, color, copy, or layout changes beyond the line height.

## Verification
- `bunx tsgo --noEmit` clean, build OK.
- Playwright at 1024×768, 1540×855, 1920×1080: beat 2 shows the longer line growing then the arrowhead, no clipping or overflow of the synthesis card, navigation unaffected.
