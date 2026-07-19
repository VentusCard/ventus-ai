## Goal

Rewrite `supabase/functions/synthesize-persona/index.ts` so the LLM natively reasons about **all 5 signal buckets in one pass**, with mutual exclusivity baked into a single ownership ladder rather than five loosely-connected prompt sections and post-hoc filters. This eliminates recurring taxonomy leaks (pets → Demographic, college → Life Event, auto loan → Life Event, duplicate pills across rows).

## The 5 signals (single source of truth)

Ranked ladder — every transaction can belong to AT MOST ONE bucket. Higher tier wins and removes the row from all lower tiers.

```
1. Life Event         (discrete, time-bounded transitions)
2. Financial Signal   (durable product relationships)
3. Demographic        (inferred state change: household, income, wealth, geography)
4. Spending Habit     (recurring lifestyle rollup)
5. Risk Factor        (owned upstream — pass-through, referenced only to prevent overlap)
```

## New prompt architecture

Replace the existing multi-section, additive prompt with a single **decision-tree prompt** that walks the model through one loop:

```
For each transaction cluster:
  1. Does it match a canonical Life Event pattern?          → Life Event, done.
  2. Does it match a Financial Product servicer pattern?    → Financial Signal, done.
  3. Does it represent a temporal state CHANGE?             → Demographic, done.
  4. Does it represent recurring lifestyle behavior?        → Spending Habit, done.
  5. Owned by Risk engine?                                  → skip entirely.
```

Every bucket definition explicitly restates:
- what it OWNS
- what it NEVER owns (with named counter-examples: pets, college, auto loan, mortgage, gambling)
- the minimum evidence threshold
- the exact `[T<n>]` accounting rule (once claimed, never reused)

## Input contract changes

Send a single unified candidate block instead of three separate ones (lifestyle txns / financial txns / demographic txns). Each `[T<n>]` line gets pre-computed hint tags the model can trust:

```
[T12] CHEWY.COM · $68 · 2026-04-11 · Pets>Pet Supplies · hints=[pet, recurring, lifestyle]
[T44] VW CREDIT · $685 · 2026-04-01 · Financial · hints=[auto_loan_servicer, monthly]
[T77] COMMON APP · $75 · 2026-03-02 · Family · hints=[college_prep, demographic_kid_college]
```

Hints are DETERMINISTIC (built from regex + merchant taxonomy already in the file) and instruct the model which bucket owns the row. The model still writes the labels and narrative, but bucket routing is guided by hints, not left to prose interpretation.

## Output contract changes

One tool call returns all 5 buckets in one object:

```
{
  life_events:        [...],
  financial_signals:  [...],
  demographic_shifts: [...],
  spending_habits:    [...],   // renamed from pillar_rollups for clarity
  audit: {
    claimed_indices: { life_event: [...], financial_signal: [...], demographic: [...], spending_habit: [...] },
    dropped_candidates: [ { index, reason } ]
  }
}
```

The `audit` block forces the model to prove mutual exclusivity — server rejects the response if any `[T<n>]` appears in two claimed lists.

## Server-side enforcement (post-LLM)

Keep a thin deterministic guard layer that:
1. Validates the audit — any overlap = drop the lower-tier row.
2. Applies hard routing overrides for known-abuse patterns (pet → Spending Habit, college → Demographic, auto/mortgage → Financial Signal). Uses the hint tags built in step 1, not string sniffing of LLM output.
3. Merges external signals (bureau tradelines, property records) with the same ladder rules.
4. Strips empty buckets and normalizes shape for the client.

## Files to change

- `supabase/functions/synthesize-persona/index.ts` — full rewrite of the prompt, schema, candidate blocks, and post-processing.
- No client changes required — `ExecDemoPage.tsx` and `ExecDemoIntelPanel.tsx` already consume `financial_signals`, `demographic_shifts`, `pillar_rollups`, and `detected_life_events`. The rewrite keeps the same 4 top-level keys (with `spending_habits` aliased back to `pillar_rollups` in the response for backward compatibility).

## Non-goals

- No changes to upstream `analyze-lifestyle-signals` — the final classifier remains the single source of truth (per prior decision).
- No changes to risk detection — Risk is pass-through.
- No UI redesign.

## Verification

- Run 3 demo customers through the new function.
- Confirm: no pet pill in Demographic; no college pill in Life Event; no auto/mortgage pill in Life Event or Spending Habit; every `[T<n>]` appears in exactly one bucket.