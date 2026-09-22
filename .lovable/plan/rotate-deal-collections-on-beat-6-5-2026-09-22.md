# Rotate deal collections on beat 6.5

The Rewards phone on the "Value: This Year" slide already has 5 deal collections in its data (tennis, dog, December vacation, home purchase, outside brokerage), but the deck freezes it on the tennis collection. This change makes the phone automatically cycle through all five collections once the presenter reaches beat 6.5, each with its own themed image.

## Changes

1. `src/components/exec-demo/GeneratedOffersPhoneView.tsx`
   - Add an optional `autoRotate?: boolean` prop.
   - The existing auto-rotation timer currently bails out in presentation mode; let it run when `autoRotate` is true (same ~5s interval, same reduced interaction rules).

2. `src/components/deckmo/DeckmoBankdemoScenes.tsx`
   - `ExactPhone` accepts a new `cycleCollections?: boolean` prop, forwarded to `ExecDemoPhoneView` → `GeneratedOffersPhoneView` as `autoRotate`.
   - When cycling is on, stop forcing the tennis image (`presentationImageUrl`) so each collection shows its own category image from the built-in image bank.
   - `PhoneScene` passes `cycleCollections={tab === "rewards" && step >= 4}` so rotation starts exactly at beat 6.5; beats 6.1–6.4 stay parked on tennis as today.

3. `src/components/exec-demo/ExecDemoPhoneView.tsx`
   - Thread the `autoRotate` prop through to `GeneratedOffersPhoneView` (one-line pass-through).

## Notes

- No changes to collection data, copy, slide order, beat counts, or other slides.
- /demo and /bankdemo phones are untouched (prop defaults keep current behavior).

## Verification

- Playwright at 1540×855: navigate to 6.1 (static tennis), advance to 6.5 and confirm the collection card cycles through all 5 collections with their own images; arrow back to 6.4 and confirm it returns to static tennis.
- Confirm build log is clean.
