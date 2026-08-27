# Fix the ticker twitch in the Customer Intelligence Core

## What's happening

Each rolling detection row in the Customer Intelligence Core cards ends with a tiny visible jump. The roll animation slides the track up by one row, then on finish it cancels the animation (snapping the track back to the top) and *then* asks React to swap in the next text. Those two things happen in different frames, so for one frame the old text is shown at the reset position — that is the twitch.

## The fix

In the ticker section of `src/components/tepilot/insights/CapabilitiesView.tsx`:

- On animation finish, commit the row-index update synchronously (`flushSync`) so the new text is already painted, and only then cancel/clear the animation transform. This removes the one-frame mismatch.
- Guard against a cancelled/unmounted section: skip the flush if the effect has already torn down, and cancel any in-flight animation in the effect cleanup so a pending roll can't fire after unmount.
- Keep the existing easing, duration, staggered start delays and reduced-motion fallback exactly as they are.

## Technical notes

- Replace the `roll.onfinish = () => { roll.cancel(); advance(); }` sequence with a finish handler that does `flushSync(advance)` first, then `roll.cancel()`.
- Track the active animation in a ref so cleanup can cancel it.
- Round the roll distance to the row height (translate by the measured row height in px instead of `-50%`) so sub-pixel layout of the two stacked rows can't leave a fractional offset.
