
# Audit: Mutual exclusion between Life Events and Demographic Shifts

## Overlaps found today

Reading `supabase/functions/synthesize-persona/index.ts` (LIFE EVENT PROMOTION §, lines 264–297, and DEMOGRAPHIC SHIFTS §, lines 423–451), the two taxonomies collide on the same transaction evidence:

| Life Event (canonical) | Demographic Shift category that duplicates it |
|---|---|
| Home Purchase / Transition | `life_stage_entry` → "Homeownership" |
| New Baby / Family Expansion | `household_composition` → "new baby" |
| Wedding / Engagement | `life_stage_entry` → "marriage" |
| Elder Care | `life_stage_entry` → "eldercare onset" |
| Relocation | `geography_relocation` (moving vendors, U-Haul, storage) |
| Retirement Planning | `income_trajectory` (SSA/pension onset) + `life_stage_entry` (retirement) |
| Inheritance / Windfall | `wealth_tier_migration` (large one-time inflow) |
| College Preparation for Dependent | `household_composition` → "kid → college" |

The current rule ("You MAY reuse a [T<n>] that also appears in a financial_signal ONLY when the demographic interpretation is genuinely distinct") is a soft nudge. That's why we see double-counting.

Financial Signals also collide with `wealth_tier_migration` (e.g. brokerage ACH → both a Financial Signal and a wealth-tier shift).

## Rule set to enforce

**Priority order (winner takes the evidence — no other bucket may reuse those [T<n>]):**

```text
Life Event  >  Financial Signal  >  Demographic Shift  >  Pillar Rollup
```

**Bucket definitions (mutually exclusive):**

- **Life Events** — discrete, time-bounded transitions with a vendor cluster in the last 90 days. Own: Home Purchase, New Baby, Wedding, College Prep for Dependent, Elder Care, Retirement Planning, Relocation, Inheritance/Windfall, Business Formation.
- **Financial Signals** — durable product relationships visible as recurring servicer ACH. Own: mortgage, auto loan/lease, student loan, brokerage/401k/IRA, insurance premiums.
- **Demographic Shifts** — *ongoing state changes* inferred from aggregate cash-flow or geography patterns, NOT from vendor clusters already claimed by a Life Event. Own only:
  - `income_trajectory` — payroll ACH step-up/step-down, payroll counterparty flip, 1099/Stripe/Square onset, unemployment credit. (SSA/pension onset moves to Retirement Planning life event.)
  - `wealth_tier_migration` — sustained contribution rate change or reserve-buffer expansion (large one-time inflow moves to Inheritance/Windfall life event).
  - `household_composition` — narrowed to shifts NOT covered by a life event: empty nest (tuition stops + travel rises), divorce (family-law + duplicate utilities), new pet.
  - `geography_relocation` — narrowed to *post-move* persistent merchant-ZIP centroid drift over 30+ days. Moving vendors themselves belong to the Relocation life event.
- **Retire** the `life_stage_entry` demographic category entirely — every subcase is already a Life Event.
- **Pillar Rollups** — behavioral themes on transactions not claimed above.

**Evidence exclusivity rule:**

- Before emitting a Demographic Shift, subtract every `[T<n>]` claimed by a Life Event or Financial Signal.
- A Demographic Shift must stand on ≥2 transactions from the remaining set. If it can't, drop it.
- A Financial Signal may co-exist with a Life Event (e.g. first mortgage ACH ↔ Home Purchase) but the transaction belongs to the Life Event's evidence array; the Financial Signal references the servicer relationship, not the same [T<n>].

## Changes in `supabase/functions/synthesize-persona/index.ts`

1. **Priority ladder** — add an explicit "EVIDENCE OWNERSHIP LADDER" block near the top of `systemPrompt` (around line 203, next to the existing "LIFE EVENTS ALWAYS WIN" note) stating the four-tier order and the exclusivity rule.
2. **Life Event section (lines 264–297)** — append: any [T<n>] emitted as life-event evidence is REMOVED from the candidate pool for demographic_shifts and pillar_rollups. Explicitly claim SSA/pension onset under "Retirement Planning" and large one-time inflow under "Inheritance / Windfall".
3. **Demographic Shifts section (lines 423–451)**:
   - Drop `life_stage_entry` from the category list, the tool schema `enum` (line 592), the response mapper (line 675+), and the `DemographicShift` type in `src/components/exec-demo/ExecDemoIntelPanel.tsx`.
   - Rewrite each remaining category description to state what it EXCLUDES (moving vendors, new-baby retailers, tuition ACH, SSA, large inflow → all belong to life events).
   - Replace the soft "MAY reuse" clause with a hard rule: "transaction_indices MUST NOT intersect with any transaction_indices already emitted under detected_life_events or financial_signals. If a shift's evidence collapses below 2 unique indices after subtraction, drop the shift."
4. **Tool schema enum** (line 592) — remove `"life_stage_entry"`.
5. **UI type** — remove `"life_stage_entry"` from the `DemographicShift.category` union in `ExecDemoIntelPanel.tsx`.
6. **Post-processing guard** in `ExecDemoPage.tsx` — after mapping the response, filter `demographicShifts` to drop any shift whose `transaction_indices` are fully contained in the union of life-event + financial-signal indices (belt-and-suspenders in case the LLM ignores the rule).

## Out of scope

- No changes to Risk Factors taxonomy.
- No copy changes in the UI pills beyond removing the retired category.
- No prompt changes for `generate-product-cards`.
