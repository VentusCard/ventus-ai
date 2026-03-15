

# Make Rewards Node Ready When Personalized Messages Are Actually Ready

## Problem
The rewards node currently fires a throwaway `deal-personalization` call using static `customerA.deals` and sets `rewards: "ready"` when it returns. But when the user clicks to view, `DemoRewardsView` derives a completely different deal set from enriched transactions and fires its own personalization call — so "ready" doesn't actually mean the messages are available.

## Plan

### 1. Move deal derivation + personalization into `useDemoEnrichment`

In `useDemoEnrichment.ts`, after both classifications complete (inside `maybeStartPhase2`), derive deal profiles from enriched transactions using the same `deriveCustomerProfile` + `getRelevantDeals` logic that `DemoRewardsView` uses. Then fire `deal-personalization` for both customers using those derived deals. Store the results in state (`personalizedDealsA`, `personalizedDealsB`). Set `rewards: "ready"` only when both personalization responses return.

Remove the current pre-fire block (lines 226-260) that uses static `customerA.deals`.

### 2. Pass personalization results through to `DemoRewardsView`

- Add `personalizedDealsA` and `personalizedDealsB` to the hook's return value
- Thread them through `DemoPage` → `DemoDetailOverlay` → `DemoRewardsView`
- In `DemoRewardsView`, skip the internal `fetchPersonalization` calls if pre-computed results are provided as props

### Files to change
- `src/hooks/useDemoEnrichment.ts` — move deal derivation + personalization here, store results, gate rewards readiness
- `src/components/demo/DemoRewardsView.tsx` — accept optional pre-computed personalization props, skip fetch if provided
- `src/components/demo/DemoDetailOverlay.tsx` — pass personalization data through
- `src/pages/DemoPage.tsx` — pass personalization data from hook to overlay

