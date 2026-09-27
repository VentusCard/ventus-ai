# Living View (3.x): raise the bottom card + animate the vertical arrow

## What changes

On the "Complete Picture" beat, two adjustments:

1. **Raise the bottom synthesis card.** The vertical connector between the customer circle and the bottom card (5 signal families + question) is currently 64px tall. Shrink it (64px → ~36px; short-height layout 40px → ~24px) so the card sits noticeably higher on the page.

2. **Animate the vertical arrow like the side signals.** The left and right horizontal connectors already carry a glowing dot that travels along them (`deck-signal-left` / `deck-signal-right`, 3.8s loop). The vertical connector only has a static chevron. Add a matching glowing dot that travels **down** the vertical line (new `deck-signal-down` keyframes, same 3.8s timing, same blue glow), with the chevron staying at the end as the arrowhead.

## Technical details

- `src/components/deckmo/DeckmoDeck.tsx` — `LivingView` (bottom block):
  - Connector line: `h-16` → `h-9` (small-height variant `h-10` → `h-6`).
  - Add an absolute dot span on the vertical line (`-left-[3px] h-2 w-2 rounded-full bg-deck-blue` + glow shadow), shown with `deck-signal-down` when flowing, parked at top when not — mirroring the horizontal connectors.
- `src/styles/base.css` — add `@keyframes deck-signal-down` (mirrors `deck-signal-left` but animates `top`: 0 → `calc(100% - 0.5rem)`, same opacity stops) and the `.deck-signal-down` class (3.8s ease-in-out infinite).
- `src/styles/animations.css` — add `.demo-page .deck-signal-down` to the reduced-motion override block so the deck keeps animating when the OS requests reduced motion (matching the other deck signals).

No copy, layout-width, or other-beat changes.
