# Make the deal collection cycling obvious on 6.5

## What I found

The cycling already works. On beat 6.5 the rewards card does change on its own — tennis, then dog perks, then the December vacation collection, each with its own image. The problem is that it changes only once every 5 seconds and the change is very quiet, so during a live walkthrough it looks like the phone is stuck on tennis.

## What changes

- Each collection stays on screen for about 2 seconds instead of 5, so all five are seen within roughly ten seconds.
- The change between collections becomes clearly visible: a stronger slide-and-fade as the new collection comes in.
- The little dots under the card become more prominent, with the current collection clearly marked, so the audience can see the phone is moving through a set.

Nothing else changes: beats 6.1 to 6.4 stay parked on the tennis collection, stepping back from 6.5 still resets to tennis, and the /demo and /bankdemo phones keep their current behavior.

## Technical notes

- `GeneratedOffersPhoneView.tsx`: interval becomes 2000ms when `autoRotate` is on (keep 5000ms elsewhere); strengthen the `collection-slide-*` animation (longer travel, opacity fade, ~0.45s) and enlarge/contrast the pagination dots when more than one group exists.
- No changes to `DeckmoBankdemoScenes.tsx`, `ExecDemoPhoneView.tsx`, or the deck script — the `cycleCollections={tab === "rewards" && step >= 4}` wiring is already correct.
- Verify at 1540x855 that 6.5 shows at least three different collections within eight seconds and that 6.4 is still static.
