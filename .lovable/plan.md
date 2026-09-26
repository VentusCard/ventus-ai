# Beat 6.5: make the holiday travel collection actually open

## What I confirmed
I played 6.4 → 6.5 in a test browser at your screen size. The counter reads 6.5 and callout 5 is highlighted, but the phone stays on the main Rewards page ("Curated for Ricky"). The collection never opens. The update from the last message builds fine and passes the slide step through to the phone, so the break is somewhere between the phone getting the step and the collection view reacting to it. I haven't found the exact cause yet.

## Plan
1. **Find the cause first.** On 6.5, inspect the running phone to see what it actually receives: the step number, whether it is told to open, and the collection name it gets. Also check whether the name lookup matches Ricky's "Annual tropical vacation in December" collection. Check whether something closes it again right away (the rotating collections, the search box, or the phone reloading when the slide changes).
2. **Fix that specific cause.** Keep the intended behavior:
   - 6.4 → 6.5: after a short pause (about 0.6s), the phone opens the holiday travel collection with all five offers.
   - 6.5 → 6.4: it closes and goes back to the rotating collections.
   - Forward again: it reopens every time.
3. **Add a fallback if the lookup is fragile.** If the name match is the problem, open the collection directly by its known name/id for the deck only. /demo stays unchanged.
4. **Verify in the browser.** Play 6.4 → 6.5 → 6.4 → 6.5 and take screenshots at 1376×1011 and 1920×1080. Confirm the collection opens and closes each time.

## Technical details
- Chain: `DeckmoDeck` Scene (`step`) → `BankdemoMidTerm` → `PhoneScene` → `ExactPhone` (`step === 4` → 600ms → `openCollection`) → `ExecDemoPhoneView` `activeRollupLabel` → `GeneratedOffersPhoneView` effect → `findGroupForLabel` → `setExpandedGroup`.
- Suspects to check: `findGroupForLabel` returning null for the label/pillar pair, `ExactPhone` remounting on step change and resetting the timer, or an effect in `GeneratedOffersPhoneView` clearing `expandedGroup`.
- Files: `src/components/deckmo/DeckmoBankdemoScenes.tsx`, and possibly `src/components/exec-demo/GeneratedOffersPhoneView.tsx` (deck-only path).
