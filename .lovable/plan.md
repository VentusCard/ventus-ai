# Personalized Deals: use all 3 behavioral pills

## Goal
In the Personalized Deals tab, every behavioral signal pill on the selected customer produces its own deal collection — not just the single highest-spend one. For Ricky J that means three collections: Biweekly advanced tennis, Recurring dog expenditures, Annual tropical vacation in December (plus the existing life-event collection).

## Root cause (confirmed)
- `buildPillarRollups` in `src/lib/personalizationGeneration.ts` already sends ALL `spendingHabits` to the edge function — the frontend is not the bottleneck.
- `supabase/functions/generate-next-offers/index.ts:23` sets `MAX_BEHAVIORAL_ROLLUPS = 1`, and the rollup list is sorted by spend and sliced to that cap (line 353). Only one behavioral cluster ever reaches the model.
- The default demo bank serves `src/lib/personalizationSnapshots.ts` instead of calling the model, and Ricky's snapshot (`c1`) only contains the tennis collection — so even raising the cap wouldn't change the default demo.

## Changes

### 1. Edge function — lift the cluster cap
- `supabase/functions/generate-next-offers/index.ts`: raise `MAX_BEHAVIORAL_ROLLUPS` from 1 to 3 so every behavioral pill on a demo customer is sent.
- The prompt already instructs "For EACH behavioral cluster, generate exactly 5 ACTIVE deals" — no prompt change needed.
- Token budget: 3 clusters × 5 deals ≈ 3× current behavioral output. `BEHAVIORAL_MAX_TOKENS` is 6,000 with `repairTruncatedJson` fallback; bump to 9,000 to keep all three collections complete and avoid silent truncation.
- Redeploy the function.

### 2. Demo snapshots — add the missing collections
- `src/lib/personalizationSnapshots.ts`: for each example customer, ensure one offer group per `spendingHabits` entry.
  - Ricky J (`c1`): add "Recurring dog expenditures" (pet food, vet, grooming merchants — e.g. Chewy, Petco) and "Annual tropical vacation in December" (luggage, travel gear, resort wear) collections, each with 5 deals following the existing tennis collection's shape (id, merchant, product, rewardValue, message, valueLine, valueMath, cta, signal: "boost", signalReason, boostCategory) and a `collectionMessage` + `imageQuery`.
  - Other customers (`c2`–`c5`): add collections for their second/third behavioral pills where missing, same format.
- Copy rules stay in force: "vaguely specific" tone, no creepy tracking, no exact spend amounts in customer-facing message lines.

### 3. Verify
- Select Ricky in Personalized Deals → three behavioral collections render alongside the life-event one; clicking each behavioral pill focuses its collection.
- Check the build log and confirm no TypeScript errors; visually confirm card heights still fit the phone mockup without scrollbars.

## Technical details
- Files: `supabase/functions/generate-next-offers/index.ts`, `src/lib/personalizationSnapshots.ts`.
- No UI component changes expected — `GeneratedOffersPhoneView` already renders multiple rollup groups and pill-to-collection focusing is already wired.
- Edge function redeploy required after the cap change.
