# Make 8.4 always start rolling right away

## Likely cause
The phone carousel on 8.4 pauses whenever the mouse is over it, or when something inside it has keyboard focus. Presenting with arrow keys, the mouse cursor often just happens to be sitting in the middle of the screen. When 8.4 appears, the phones slide in under the cursor, and the roll stays paused until the mouse moves away. That fits "sometimes": it only happens when the cursor is parked in that spot.

## Fix
- Don't pause just because the cursor happens to be over the phones. Pause only after the mouse actually moves over them (a real hover), and start rolling again when it leaves.
- Every time 8.4 is entered, clear the hover pause so the roll starts after the handoff animation (about 1.5s), just as it does now.
- Pausing when someone clicks into a chat box stays the same. When they click out, rolling picks up again.
- No changes to the 8.3 → 8.4 handoff, the timing, the phones, or the copy.

## Technical details
- `src/styles/animations.css`: remove `.deckmo-carousel-viewport:hover` from the pause rule. Add a `.deckmo-carousel-viewport[data-paused="true"]` pause rule instead, and keep `:focus-within`.
- `RetentionShowcase` in `src/components/deckmo/DeckmoBankdemoScenes.tsx`: keep a `paused` state that starts as `false` on mount. Set it to true on `onPointerMove` (so a cursor parked over the phones without moving doesn't count) and back to false on `onPointerLeave`. Render it as `data-paused` on the viewport.
- Check at 1540×855 with Playwright: park the mouse at screen center, arrow from 8.3 to 8.4, and confirm the track's transform changes after about 2s.
