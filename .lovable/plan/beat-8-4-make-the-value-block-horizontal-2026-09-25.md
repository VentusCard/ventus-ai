# Beat 8.4: Make the value block horizontal

## Goal
In the 8.4 showcase header, convert the compact "Value for the bank" block into a single-row horizontal layout so it takes less vertical height.

## Change
- In `src/components/deckmo/DeckmoBankdemoScenes.tsx`, extend `SceneValueBlock` with a horizontal layout for its `compact` variant (used only by 8.4's `RetentionShowcase`).
- One row, items aligned on a baseline: the "Value for the bank" eyebrow, the metric (`4.5%+`) in bold, then the label ("In-app engagement and NPS score") beside it.
- Keep the existing blue-accent styling (left border, blue-50 background) so it still reads as the same element family as beats 5-8; beats 5-8 blocks stay unchanged.

## Verification
- Confirm the block renders on one line under the 8.4 title at 1540x855 and 1920x1080, with no wrapping or clipping.
- Confirm beats 5-8 value blocks are untouched.
