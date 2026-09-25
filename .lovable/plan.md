# Smooth transition from Beat 8.3 to 8.4

## Goal
Turn the current hard swap into one continuous visual handoff: the live Hawaii assistant from 8.3 remains on screen, moves into the 8.4 carousel, and the rest of the showcase arrives around it.

## Changes
- Keep the 8.3 scene and 8.4 showcase mounted during the handoff instead of instantly hiding one and mounting the other.
- On the forward arrow from 8.3 to 8.4:
  1. Fade and slide the 8.3 heading and callouts away.
  2. Move and scale the Hawaii phone smoothly from its centered 8.3 position into the first visible carousel position.
  3. Fade in the 8.4 heading, subtitle, edge masks, and neighboring phones.
  4. Start the continuous right-to-left carousel only after the handoff settles, avoiding a speed or position jump.
- Reverse the sequence when navigating back from 8.4 to 8.3, so the Hawaii phone returns naturally to its original position.
- Preserve the Hawaii conversation and all typed follow-ups through the transition using the existing shared chat persistence.
- Respect reduced-motion preferences with a short crossfade instead of movement.

## Kept unchanged
- All phone content, labels, dimensions, 11:20 proportions, chat interactions, and independent histories.
- The continuous carousel speed, spacing, side fades, pause-on-hover/focus behavior, and arrow-only deck navigation.
- Every other beat and `/demo`.

## Validation
- Verify forward and backward 8.3 ↔ 8.4 transitions at 1540×855 and 1920×1080.
- Confirm there is no flash, duplicate visible Hawaii phone, sudden carousel jump, clipping, or footer overlap.
- Confirm the Hawaii conversation remains at the same state and scroll position after both transitions.
- Confirm reduced-motion behavior and a clean build.
