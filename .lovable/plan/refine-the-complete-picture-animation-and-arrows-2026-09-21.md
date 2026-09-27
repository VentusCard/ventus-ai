# Refine “The Complete Picture” animation and arrows

## What I found

- Both side arrows correctly point inward toward the customer, but their current placement overlaps the circle edge and reads more like a static icon than part of the flow.
- The blue and gold signal dots animate continuously on both beats, even while the colored feeder lines are only partially extended on beat one. This makes the motion feel detached from the line state.
- Beat two reveals the synthesis card, but the side signals, customer pulse, downward connector, and card reveal do not currently form one coordinated sequence.

## Changes

- Keep both source arrows pointing inward, but center them cleanly within their feeder lanes and prevent overlap with the customer rings.
- Make beat one a restrained continuous “data flowing inward” state: full visible feeder lines, synchronized blue and gold signal movement toward the customer, and a subtle customer pulse.
- Make beat two a clear synthesis sequence: complete the inward flow, emphasize the customer node, draw the vertical connector downward, then reveal the two-line signal-family card.
- Coordinate delays and durations so the movement reads as one cause-and-effect story rather than several independent animations.
- Preserve the current copy, source cards, five-family card, two beats, deck navigation, and light presentation style.
- Keep a motion-reduced version with static arrows, fully visible lines, and immediate content visibility.

## Technical details

- Update the LivingView feeder lanes and arrow positioning in `src/components/deckmo/DeckmoDeck.tsx`.
- Refine the existing `deck-signal-left`, `deck-signal-right`, breathing, and reveal timing rules in `src/styles/base.css`; no new animation library.
- Keep animation scoped to this slide and activate it only while this section is visible.

## Verification

- Review both beats at 1024×768, 1540×855, and 1920×1080.
- Confirm arrows point inward, moving dots stay on their lines, the second-beat sequence reads in order, and nothing clips or overlaps.
- Confirm reduced-motion behavior, keyboard/footer navigation, and a clean preview build.
