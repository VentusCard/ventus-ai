# Longer, faster roll for the 4.1 Ricky ledger

## What changes
The ledger roll on deckmo slide 4.1 currently runs about 1.15 seconds with a soft bounce ("tweak") at the end. Per your feedback it should roll longer, move faster, then stop crisply.

## How
Single-file change in `src/styles/base.css` (the `deck-ricky-ledger-roll` keyframes and its `.deck-ricky-ledger-roll` rule):

- Increase total duration from ~1.15s to ~2.2s — the roll runs noticeably longer.
- Make the roll travel faster and farther during the main phase: keep it moving at a fast, near-linear speed through most of the animation instead of easing out early.
- Remove the bounce/overshoot tail — the final segment decelerates very briefly (last ~15%) and locks to the final position with no jiggle.
- Keep the existing start (slight blur/fade in) and the `prefers-reduced-motion` fallback unchanged.

No changes to components, beat timing, or any other slide.

## Verification
- Open /deckmo at 1540x855, go to beat 4.1 and confirm: faster roll over a longer run, clean stop with no bounce, list settles exactly on the real ledger.
- Confirm 4.2+ unaffected and the build log is clean.
