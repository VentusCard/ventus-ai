

## Goal

Make the **Life Event** Behavioral Deal Collection card (e.g. "College Preparation for Dependent") visually and informationally match the **Persona** version (e.g. "Frequent Hawaii Traveler"):

1. Show **boost-category chips** in the header row (e.g. "Tuition", "Test Prep", "Dorm Essentials") — same green-trend chips that appear next to the Hawaii Traveler pill.
2. Show **suppressed-category chips** (already-purchased / already-covered) — same gray "✓" chips.
3. Replace the generic deal-tile rationale (`↑ Merchant evidence for Home Purchase`) with a **specific behavioral rationale** per deal (matching the per-deal `signalReason` quality of the persona side: e.g. `↑ Recurring Khan Academy spend → SAT prep gap`).

## Root cause

In `supabase/functions/generate-next-offers/index.ts`:

- The **rollup (persona)** prompt explicitly requires `boostCategory` per deal AND a top-level `suppressedCategories` array AND a "meaningful signalReason". That's why Hawaii Traveler renders rich chips + specific reasons.
- The **life-event** prompt (`LIFE_EVENT_SYSTEM_PROMPT`):
  - Lists `boostCategory` as "optional" → LLM omits it → no green chips.
  - Does not mention `suppressedCategories` at all → LLM omits it → no gray "already covered" chips.
  - Has no specificity requirement for `signalReason` → LLM returns generic strings like "Merchant evidence for Home Purchase" → falls through to the fallback in code.
- The normalization step on line 215-234 already reads `boostCategory` and `suppressedCategories`, so just fixing the prompt is enough — no client changes needed for chips.
- The UI in `NextOfferRationale.tsx` already renders both chip types from `group.suppressedCategories` and from `deals[].boostCategory` — confirmed at lines 51-54 and 83-94. So once the LLM emits them, they'll appear.

## Plan

### 1. `supabase/functions/generate-next-offers/index.ts` — strengthen `LIFE_EVENT_SYSTEM_PROMPT`

Update the life-event system prompt to mirror the rollup prompt's requirements:

- **Require `boostCategory`** on every deal (short product-type label tied to the life event, e.g. "Tuition Savings", "Dorm Essentials", "Test Prep", "Mortgage Tools", "Moving Services").
- **Require `suppressedCategories`** at the rollup level (0-3 items the customer already covers based on evidence merchants — e.g. for College Prep with Khan Academy already in evidence, suppress "Online Tutoring").
- **Require specific `signalReason`** per deal — must reference an evidence merchant or behavioral signal (e.g. `"Khan Academy subscription → upgrade to live SAT prep"`, `"3 mortgage rate searches → ready for closing-cost coverage"`). Forbid generic phrasing like "Merchant evidence for X" or "Aligned with this life event".
- Update the example JSON shape in the prompt to include `boostCategory` and `suppressedCategories`.

### 2. (Optional safety) `NextOfferRationale.tsx`

No changes required — chip-rendering logic already reads `group.suppressedCategories` and `deal.boostCategory`. Once the LLM emits them, they appear automatically.

### 3. Out of scope

- Persona / rollup prompt (already correct).
- Color override system (already done in prior plan).
- Card layout / chip styling.

## Verification

1. Run analysis on `/demo`, click "College Preparation for Dependent".
   - Header chips include green-trend chips like "Tuition", "Test Prep" + at least one gray "✓ Already covered" chip if evidence supports it.
   - Each deal tile shows a specific `↑ {reason}` line (no more generic "Merchant evidence for Home Purchase").
2. Click "Home Purchase" → same chip treatment with home-buying boostCategories ("Mortgage Tools", "Moving", "Insurance").
3. Click persona pill (Hawaii Traveler) → behavior unchanged.

## Files touched

- `supabase/functions/generate-next-offers/index.ts` — only the `LIFE_EVENT_SYSTEM_PROMPT` constant (lines 38-54).

