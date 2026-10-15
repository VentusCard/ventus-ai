# Restore slide 4.1’s reveal

## Confirmed cause
The deck mounts every section immediately. Ricky’s row animation is applied even while Section 4 is off-screen, so it finishes before you reach 4.1 and does not restart on entry.

## Changes
- Start the staggered five-family reveal when slide 4.1 becomes visible, not when the deck first loads.
- Replay the reveal when returning to 4.1, including from 4.2.
- Keep 4.1’s external signals as inactive, faint placeholders; reveal them on 4.2 without replaying the internal rows.
- Preserve the pill pop-ups, nested attributes, wording, family order, and arrow-only navigation.
- Respect reduced-motion preferences with immediate visibility instead of animation.

## Technical approach
- Pass explicit scene activity into `RickySignalStory` from `RickyStoryScene` in `DeckmoDeck.tsx`.
- Gate row animation and its restart on active 4.1 entry, accounting for the deck’s slide transition so the reveal is visible.
- Keep animation lifecycle changes scoped to this deck story; update its CSS only if needed.

## Verification
- Add a focused regression test for inactive versus active reveal state and return-entry behavior; run the relevant deck tests.
- In the live preview, navigate from Section 3 to 4.1 and verify the rows visibly cascade, then verify 4.2’s external reveal.
- Return to 4.1 and re-enter from another section; confirm the animation replays and pill clicks still open details without changing slides.
- Check the current 1691×1011 view and smaller desktop sizes, reduced motion, and recent build/runtime errors.