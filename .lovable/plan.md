

## Root cause (re-diagnosed)

I traced the click path:

1. User clicks the amber life-event pill `College Preparation for Dependent` in `ExecDemoIntelPanel` (line 358–393).
2. The handler is gated: `onClick={() => isClickable && onTriggerPillClick?.(...)}` where `isClickable = matchedIndices.length > 0` (line 367).
3. `matchedIndices` is computed by fuzzy-matching `evt.evidence[].merchant` against `transactions[].merchant`. **If no merchant string matches, `matchedIndices = []` and the click is silently swallowed.**
4. Because the click never fires, `activeTriggerPill` stays `null` → `PurchaseCycleTimeline` falls back to `selectedRollup = rollups[0]` ("Premium Hawaii Jetsetter") → `NextOfferRationale` filters by that label.

That's why the phone mockup (which renders **all** `generatedOffers`) shows the College Prep deals correctly, but the center "Behavioral Based Deal Collection" card stays stuck on the persona's top behavioral rollup.

The earlier fix made the *backend* mapping bulletproof and the *NextOfferRationale* matcher fuzzy — but neither helps when the **click itself never registers**, which is the actual failure mode here.

## Fix — make life-event pills always clickable

**File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`** (life-event pill block, ~lines 357–393)

1. **Remove the `isClickable` gate** for life-event pills. The pill should always be clickable so it can update the active offer filter — even when no `transactions[]` row matches the evidence merchant fuzzily.
2. When `matchedIndices` is empty, still call `onTriggerPillClick(evt.event_name, [], "#f59e0b")`. The downstream offer filter only needs the *label*; the indices are used to highlight transactions in the left panel and an empty list is acceptable (no rows highlighted, but the offer card updates correctly).
3. Keep `cursor-pointer` always-on for life-event pills.

**File: `src/pages/ExecDemoPage.tsx`** (`filteredIndices` memo, ~line 778–797)

- When `activeTriggerPill.indices` is empty, return `null` (no filter) instead of `[]` (which would highlight zero rows and look broken). This way the left panel just shows everything when the click can't resolve specific txns.

## Why this is the right fix

- The "Behavioral Based Deal Collection" card is driven solely by `activeRollupLabel` / `activeRollupPillar`, not by transaction indices. Decoupling the click-to-offer-filter from the click-to-transaction-highlight is the correct separation of concerns.
- The phone mockup already proves the deals are generated and present in `generatedOffers`. The only missing wire is the click event reaching `setActiveTriggerPill`.
- No edge function or prompt changes needed.

## Files touched

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — drop `isClickable` gate on life-event pills; always invoke `onTriggerPillClick` with whatever indices exist (possibly empty).
- `src/pages/ExecDemoPage.tsx` — `filteredIndices` returns `null` when `activeTriggerPill.indices` is empty so the left panel doesn't dim everything.

## Out of scope

- Risk pill clickability (uses similar gating but works because `transaction_id` mapping is reliable).
- Offer matching / generation logic (already correct).
- Cadence card behavior (unchanged — it'll show the amber "Life Event Trigger" callout when no cadence available).

