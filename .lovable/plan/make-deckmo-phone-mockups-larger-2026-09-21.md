# Make deckmo phone mockups larger

## Goal
The phone mockup should take up more of the screen on the three phone slides: Immediate Value, Mid-Term Value, and Long-Term Value.

## Current state (verified)
- All three slides use the same phone sizing: 700x384px full-size, 620x340 when viewport height is <=900px, 540x300 when <=800px.
- The center grid column holding the phone is 400px wide, and the slide grid has 40px vertical padding (py-10).
- The phone content (ExecDemoPhoneView) scales uniformly to the frame size, so enlarging the frame enlarges everything inside safely.

## Changes

1. **Enlarge the phone at each screen-size tier** (identical classes in two files):
   - `src/components/deckmo/DeckmoBankdemoScenes.tsx` (ExactPhone wrapper, ~line 49)
   - `src/components/deckmo/DeckmoRecentTransactionsTab.tsx` (wrapper, ~line 81)
   - New sizes: default 840x462px; <=900px viewport height 660x364px; <=800px height stays 540x300px (already fills 1024x768).

2. **Give the phone more room in the slide layout**:
   - Widen the center grid column from 400px to 480px (DeckmoBankdemoScenes.tsx lines 71 and 82).
   - Reduce slide vertical padding from py-10 to py-6 so the taller phone fits at 855px-tall viewports without clipping.

3. **Verification (Playwright)** at 1024x768, 1540x855, and 1920x1080 on slides 5 (Immediate), 7 (Mid-Term), and 10 (Long-Term):
   - Phone is visibly larger, nothing clipped top or bottom, header/callout columns still readable, build log clean.

## Notes
- Slides without a phone (opener, 360 view, complete picture, bank tools, close) are untouched.
- The /demo app phone is untouched.
