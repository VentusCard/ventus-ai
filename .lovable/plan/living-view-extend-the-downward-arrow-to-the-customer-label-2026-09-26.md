# Living View: extend the downward arrow to the customer label

## Goal

On beats 3.2/3.3 the vertical connector between the customer circle and the bottom synthesis card floats disconnected: there is a 77px gap between "ONE LIVING CUSTOMER VIEW" (bottom at y≈540) and the top of the arrow line (y≈617). Make the arrow longer and visually connected to the customer section, while keeping the synthesis card at its current raised position.

## Change

`src/components/deckmo/DeckmoDeck.tsx` — LivingView bottom connector block (the `relative mx-auto h-9 w-px` div):

- Change `h-9` → `h-[100px]` and add `-mt-[64px]` so the line grows upward into the existing gap. The negative top margin exactly cancels the added height, so the chevron and the synthesis card keep their current positions — the card stays raised.
- Result: the line's top lands ~13px below the "ONE LIVING CUSTOMER VIEW" label, visually joining the customer node to the card in one continuous flow.
- Keep the small-height variant proportionate: `[@media(max-height:800px)]:h-6` → `[@media(max-height:800px)]:h-10` with a matching smaller pull-up (e.g. `-mt-6`).
- The traveling `deck-signal-down` dot uses percentage-based keyframes over the line's own height, so it automatically travels the full longer line with no keyframe changes.

## Out of scope

- No copy, layout width, card size, or other-beat changes.
- The horizontal left/right signals and the ChevronDown arrowhead stay as they are.

## Verification

- Playwright at 1540×855 and 1920×1080: gap label→line ≈ 13px, line bottom and card top unchanged (card stays at its raised position), dot animates the full line (sample `getBoundingClientRect().top` over ~4s), 3.3 reveals the card normally.
- Build clean.
