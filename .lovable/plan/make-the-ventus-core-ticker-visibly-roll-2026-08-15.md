# Make the Ventus Core ticker visibly roll

The row text currently changes but the motion between the two states is not perceivable. The current approach depends on React committing a `transition` + `transform` change in the same paint, which is timing-fragile, and even when it interpolates the movement is a 20px slide of 11.5px text over 700ms — too small and too fast to read as a roll.

## Changes (Systems tab → Customer Intelligence Core, five signal rows)

1. **Drive the roll with the Web Animations API instead of a React style transition.**
   Keep a ref to the track element and call `element.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(0,-100%,0)' }], …)` on each tick. On `finish`, advance the index and reset the transform. This removes all dependence on React's style-commit timing — the animation is guaranteed to start and run.

2. **Make the motion readable.**
   - Duration ~900ms with `cubic-bezier(0.22, 1, 0.36, 1)`.
   - Increase the ticker row height so the travel distance is larger and the slide is obvious.
   - Fade the outgoing row out and the incoming row in across the roll (paired opacity animations) so the eye catches the movement even at small text sizes.

3. **Keep the belt continuous.** One persistent track element holding the current and next example; no remounts, no `key` churn.

4. **Stagger and pacing.** Keep per-row start delays so the five rows never roll in the same frame; interval stays around 3.4s so each roll is clearly separated from the next.

5. **Reduced motion.** With `prefers-reduced-motion: reduce`, skip `animate()` entirely and swap the text instantly.

6. **Layout safety.** Fixed track window height so the taller rows do not shift the Ventus Core card or its neighbours.

## Verification

Drive `/bankdemo` → Systems in the live preview and capture element screenshots of one signal row at ~100ms intervals through a full cycle, confirming intermediate frames show two partially visible rows (a real slide), not an instant swap. Check the console for errors.

## Files

- `src/components/tepilot/insights/CapabilitiesView.tsx` — `SignalSection` ticker
