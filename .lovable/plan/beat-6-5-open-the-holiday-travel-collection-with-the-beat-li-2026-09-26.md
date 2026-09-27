# Beat 6.5: open the holiday travel collection with the beat, like 5.3 → 5.4

## What I confirmed
I played 6.4 → 6.5 in a test browser at your screen size. The counter reads 6.5, but the phone stays on the main Rewards page. The collection never opens. Beat 5.4 works differently: the JFK page opens straight from the slide step, with no timer. That's the behavior you want here.

## Change
- 6.4 → 6.5: the holiday travel collection opens right away with the beat, showing all five offers. No pause.
- 6.5 → 6.4: it closes and goes back to the rotating collections.
- Forward again: it opens again every time.
- /demo and beats 6.1–6.4 stay the same.

## Steps
1. Use the 5.4 approach. Work out "open" directly from the step (`step === 4`) and pass the collection name straight through, instead of setting it later with a timer.
2. Find out why the collection doesn't open even when it gets the name. Check whether Ricky's "Annual tropical vacation in December" collection is matched, and whether something closes it right away (the rotating collections, the search box, or the phone reloading on slide change). Fix whichever one it is. If the name match turns out to be unreliable, open that collection directly by name on the deck only.
3. Check it in the browser. Play 6.4 → 6.5 → 6.4 → 6.5 at 1376×1011 and 1920×1080 and take screenshots each time.

## Technical details
- `src/components/deckmo/DeckmoBankdemoScenes.tsx` `ExactPhone`: remove the `openCollection` state and the timer effect. Pass `activeRollupLabel={cycleCollections && step === 4 ? HOLIDAY_TRAVEL_ROLLUP : undefined}` and the matching pillar.
- Chain to verify at runtime: `ExecDemoPhoneView` → `GeneratedOffersPhoneView` sync effect → `findGroupForLabel` → `setExpandedGroup`. Possibly adjust the deck-only path in `GeneratedOffersPhoneView.tsx`.
