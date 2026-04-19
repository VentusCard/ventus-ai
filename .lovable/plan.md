
## Rebuild goal

Rebuild the executive demo so the "Behavioral Based Deal Collection" has exactly one source of truth:

- selected persona rollup from `synthesize-persona`
- its own `txIndices`
- deals generated only for those deduped rollups

No life-event matching logic, no pillar-based offer routing, no legacy trigger fallback for this panel.

## Root cause

The current code still mixes two paradigms:

1. new persona-driven deal generation
2. old trigger-pill routing (`activeTriggerPill`, life-event label matching, `"Life Event"` special cases)

That split leaves the offer panel depending on label-based routing paths that no longer match the actual generation source.

## Rebuild plan

### 1. Make persona rollup selection the only offer selector
In `src/pages/ExecDemoPage.tsx`:

- remove `activeTriggerPill` from the Next-Offer flow
- keep `activeRollup` as the only selector for the Behavioral Based Deal Collection
- stop passing life-event labels into the offer panel path
- keep life-event/risk pills only for other UI uses, not offer filtering

Result:
- click persona pill → selects a rollup
- offer panel always filters by that selected rollup only

### 2. Simplify `PurchaseCycleTimeline`
In `src/components/exec-demo/PurchaseCycleTimeline.tsx`:

- remove `activeTriggerLabel` / life-event precedence logic
- derive `activeOfferLabel` only from `selectedRollup?.label`
- remove the life-event placeholder card for this panel
- if no rollup is selected, show the standard “select a persona pill” empty state

Result:
- this component becomes persona-only, which matches the backend contract

### 3. Simplify `NextOfferRationale`
In `src/components/exec-demo/NextOfferRationale.tsx`:

- remove `activeRollupPillar`
- remove all life-event-specific filtering branches
- filter offers by exact selected rollup label only
- if no matching group exists, show a clean empty state for that rollup
- keep rendering strictly against returned `rollupOffers`

Result:
- no more fuzzy/legacy routing logic
- no chance of life-event labels contaminating the deal collection

### 4. Tighten the generated-offers payload contract
In `src/pages/ExecDemoPage.tsx` and `supabase/functions/generate-next-offers/index.ts`:

- send only deduped persona rollups with:
  - `label`
  - related categories
  - related merchants
  - related transaction count
- keep server-side label enforcement so returned groups always map back to the exact sent rollup labels
- optionally sort rollups by strongest evidence before sending so UI order and response order stay stable

Result:
- deal generation and UI selection operate on the same exact rollup labels

### 5. Remove leftover clickable affordances that imply offer targeting
In `src/components/exec-demo/ExecDemoIntelPanel.tsx`:

- keep life-event pills visually separate and informational
- ensure they do not appear selected for the analytics/offer flow
- remove any active-state dependency on `activeTriggerLabel` inside the Next-Offer context
- fix the `React.Fragment` invalid prop warning while touching this file

Result:
- the user sees one clear interaction model: persona pills drive the Behavioral Based Deal Collection

## Expected behavior after rebuild

```text
Run analysis
→ synthesize-persona returns deduped rollups
→ generate-next-offers runs for those rollups only
→ first persona rollup auto-selects
→ click any persona pill
→ shopping pattern card + Behavioral Based Deal Collection both update to that same rollup
```

Life-event pills remain visible, but they do not control this panel.

## Files to update

- `src/pages/ExecDemoPage.tsx`
- `src/components/exec-demo/PurchaseCycleTimeline.tsx`
- `src/components/exec-demo/NextOfferRationale.tsx`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- `supabase/functions/generate-next-offers/index.ts`

## Verification

After implementation I will verify these cases:

1. analysis run generates offers only for deduped persona rollups
2. first persona rollup auto-loads in Behavioral Based Deal Collection
3. clicking each persona pill swaps to its own deals only
4. clicking life-event pills does not affect the Behavioral Based Deal Collection
5. no more cross-contamination from previous selections
6. console warning about invalid `React.Fragment` prop is gone
