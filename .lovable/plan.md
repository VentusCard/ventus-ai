# Fix the Ventus Core ticker roll (Systems tab)

## What I verified in the live preview

- The five "Customer Intelligence Core" signal rows each roll via a CSS keyframe (`core-roll-track`, 0.55s, translateY 0 → -50%).
- Measured frame-by-frame in the running app: the transform values do interpolate (0 → -20px), so the keyframe itself is wired correctly.
- The problem is how the roll is driven, not the keyframe:
  - The track `div` is keyed by `key={cycle}`, so React **destroys and recreates** the element on every tick. Each tick starts a brand-new element, a new paint, and a new compositor layer — the first frames of a 0.55s animation get dropped, so it reads as an instant swap rather than a roll.
  - The animation is short (0.55s) and has no compositor hints (`will-change`), while it sits inside a heavy blurred/animated panel — under load the browser collapses it into one or two frames.
  - All five rows can tick close together, multiplying the cost at the same moment.
  - Only two rows exist in the track and the finished state relies on `forwards`, so there is no continuous belt to roll into.

## The fix

1. **Stop remounting.** Keep one persistent track element per signal row. No `key={cycle}`.
2. **Drive it as a continuous belt.** Render the current and next example as stable rows and move the track with a CSS `transition` on `transform` (0 → -20px), then silently reset with the transition disabled after it completes. State moves, the DOM node never dies.
3. **Make the motion readable.** Lengthen to ~700ms with a soft ease (`cubic-bezier(0.22, 1, 0.36, 1)`), add `will-change: transform` and `translateZ(0)` on the track so it stays on its own layer.
4. **Stagger the rows.** Space each of the five signal rows' cycles so no two roll in the same frame; keep the existing 24h counts and click-to-select behaviour untouched.
5. **Respect reduced motion.** With `prefers-reduced-motion`, swap text instantly with no transform (current `motion-safe:` behaviour preserved).
6. **Clean up.** Remove the now-unused `core-roll-track` keyframe/animation from `tailwind.config.ts` if nothing else uses it.

## Verification

Re-run the live-preview instrumentation on `/bankdemo` → Systems: sample the track transform every animation frame across several cycles and confirm each transition produces a continuous ramp of intermediate values (not a two-value jump), with no console errors.

## Files

- `src/components/tepilot/insights/CapabilitiesView.tsx` — `SignalSection` ticker logic and markup
- `tailwind.config.ts` — remove the obsolete keyframe/animation entry
