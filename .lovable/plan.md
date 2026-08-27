# Fix: "Biweekly advanced tennis" produced no deals

## What actually happened

The generation logs for the last run show it clearly:

```text
[NEXT-OFFERS] ▶ invoked: method=POST
Failed to parse rollup AI response (finish_reason=length ...) { "rollupOffers": [ { "rollup": "Biweekly advanced tennis", ... "deals": [ { "id": "tennis_d1", "merchant": "Wilson", "product": "Pro Staff Racquets and Triniti Balls",
[NEXT-OFFERS] life event "Buying a house above $1.5M" (LE_1) → matched
[NEXT-OFFERS] ◀ returning 2 groups
```

The tennis collection *was* generated, but the model hit the output-token
ceiling mid-way through the first deal (`finish_reason=length`). The salvage
routine could not repair a JSON string that was cut before a single deal object
closed, so the entire behavioral group was dropped and only the life-event and
financial-signal groups came back — 2 groups instead of 3.

So this is not a signal-matching problem; it is an output-budget + failure-
handling problem in the `generate-next-offers` function.

## Why the budget runs out

- The behavioral call is capped at 4,000 output tokens (`COPY_MAX_TOKENS`),
  which was tightened earlier to control credit spend.
- Gemini 3.5 Flash spends part of that budget on internal reasoning before
  emitting JSON, so the usable JSON budget is well under 4,000.
- Each behavioral deal carries a lot of required fields (message, valueLine,
  valueMath, cta, signalReason, boostCategory), so 5 grounded deals plus the
  rollup wrapper can exceed what is left.

## Changes

1. **Give the behavioral call its own, larger ceiling.** Split the single
   `COPY_MAX_TOKENS` into per-call budgets and raise the behavioral one
   (~6,000) while leaving the life-event and financial-signal calls where they
   are. Only one behavioral cluster is sent per request, so the extra headroom
   is bounded.

2. **Make truncation recoverable.** Improve `repairTruncatedJson` so it also
   trims back through an unterminated string/partial object and closes the
   `deals` array at whatever complete deals exist. A group with 3 valid deals is
   far better than no group.

3. **Never return an empty behavioral group silently.** If, after repair, the
   behavioral response still yields nothing, retry the call once with a
   reduced-verbosity instruction (shorter valueLine, fewer words) before giving
   up, and log the retry outcome.

4. **Log the shape of the failure.** Include the cluster labels that were sent
   and the count of groups/deals recovered, so a truncation is obvious in logs
   without needing to read raw JSON.

5. **Refresh Ricky J's cached snapshot** in `src/lib/personalizationSnapshots.ts`
   after the fix so the demo shows the tennis collection instantly.

## Technical notes

- File: `supabase/functions/generate-next-offers/index.ts`
  - `COPY_MAX_TOKENS` → `BEHAVIORAL_MAX_TOKENS` / `EVENT_MAX_TOKENS` /
    `SIGNAL_MAX_TOKENS`.
  - `repairTruncatedJson`: add a string-aware backtrack (drop trailing partial
    object, close `]}]}`), and reject repairs that yield zero deals.
  - One bounded retry for the behavioral call only; no timeout wrappers around
    gateway fetches.
- Snapshot refresh reuses the same regeneration path used previously for `c1`.

## Verification

- Invoke the deployed function with Ricky J's payload and confirm the response
  contains 3 groups including `"Biweekly advanced tennis"` with 5 deals.
- Re-check function logs for `finish_reason=length`.
- Load the Personalized Deals tab for Ricky J and confirm the tennis collection
  renders with imagery.
