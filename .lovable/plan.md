# Quick transaction roll-in for Ricky 4.1

## Experience
- When slide 4.1 becomes active, quickly roll the transaction rows upward through the left ledger, then decelerate and stop on the normal transaction list.
- Keep the column header fixed while the rows move inside the existing clipped, scrollable area.
- Run the effect once each time the presenter navigates into 4.1, including returning from another slide; do not loop.
- Stop the motion before the presenter advances to 4.2, where the existing customer-intelligence cascade remains unchanged.
- Under reduced-motion settings, show the final transaction list immediately.

## Technical details
- Use the Ricky scene's existing `active` and `step` values to trigger a dedicated one-shot ledger animation only for step 0.
- Animate only the transaction-row container, preserving row content, filtering, manual scrolling, layout, and pill interactions.
- Add a short deck-specific keyframe with a fast initial roll and eased landing; avoid reusing the continuous Visibility Gap roller.

## Verification
- Check direct entry to 4.1, forward navigation, and return from 4.2 or 5.1.
- Confirm the header stays fixed, rows never escape the ledger, the animation stops cleanly, and 4.2 pill behavior is unchanged.
- Verify at 1024×768, 1540×855, and 1920×1080, including reduced-motion behavior and a clean preview build.
