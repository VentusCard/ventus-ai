# Beat 6.5: open the holiday travel collection when arriving from 6.4

## Problem
The rewards phone opens the holiday travel collection on a single timer that starts when section 6 first appears (6.1), not when you reach 6.5. Arriving at 6.5 from 6.4 does not trigger it, so it doesn't behave like the other beat transitions.

## Change
- Tie the collection opening to the current beat: when you arrive at 6.5, the phone opens the holiday travel collection after a short beat (about 0.6s, so it reads as a deliberate step).
- Going back to 6.4 (or earlier) closes the collection and the phone returns to the rotating collections view.
- Going forward to 6.5 again opens it again, every time.
- Beats 6.1–6.4 show the rotating collections as usual, with no surprise auto-open.

## Technical details
- `src/components/deckmo/DeckmoBankdemoScenes.tsx`: pass `step` from `PhoneScene` into `ExactPhone`. Replace the mount-only 2600ms effect with one keyed on `step`: when `cycleCollections && step === 4`, set `openCollection` true after ~600ms; otherwise set it false immediately. Clear the timer on change.
- `GeneratedOffersPhoneView` already expands/collapses from `activeRollupLabel`, so no changes there. No copy, layout, or /demo changes.
- Verify with Playwright: 6.4 → 6.5 opens the collection, 6.5 → 6.4 closes it, and forward again reopens.
