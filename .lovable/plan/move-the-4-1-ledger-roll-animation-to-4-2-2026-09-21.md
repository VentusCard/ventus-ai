# Move the 4.1 ledger roll animation to 4.2

## What changes
- In `src/components/deckmo/DeckmoDeck.tsx` (Ricky scene, line ~295), change the animation trigger from `active && step === 0` to `active && step === 1`.
- No CSS changes — the `deck-ricky-ledger-roll` keyframes in `src/styles/base.css` (2200ms linear roll with eased stop) stay exactly as they are.

## Result
- Slide 4.1 shows the settled transaction ledger immediately (no roll).
- Slide 4.2 plays the long, fast roll with the clean stop when first shown.
- Reduced-motion behavior and all other slides unchanged.

## Verification
- Playwright at 1540×855: land on 4.1 (no roll applied), advance to 4.2 (class present, transform animates and settles at translateY(0)).
- Check build log is clean.
