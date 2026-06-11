Update the Campaign Engine LLM in `supabase/functions/generate-campaign-offers/index.ts` with two changes. Prompt + schema only — no client/UI changes.

## 1. Hard composition rule for the 5 exemplars

Replace the current soft diversity rule with a **fixed slot allocation** the model must always satisfy when `decision = SEND`:

- Slot 1: BEHAVIORAL (primary spend category)
- Slot 2: BEHAVIORAL (secondary spend / bonus-earn tier OR a second distinct primary)
- Slot 3: LIFE_EVENT
- Slot 4: DEMOGRAPHIC
- Slot 5: FINANCIAL

Fallback rule: if a slot's family has zero qualifiers, fill it with an extra BEHAVIORAL exemplar and note `slot_fallback: true` in `why`. Keep `examples.length === 5`.

Schema change in `EMIT_TOOL`:
- Extend `examples[].angle` enum from `["BEHAVIORAL","LIFE_EVENT","FINANCIAL"]` to `["BEHAVIORAL","LIFE_EVENT","DEMOGRAPHIC","FINANCIAL"]`.
- Add required `examples[].slot` field: integer 1–5 matching the allocation above.

Update L5/L6 prompt section "Surface EXACTLY 5 examples chosen for diversity" → "Surface EXACTLY 5 examples using the fixed slot allocation" with the bullets above. Keep `cards_used` family-coverage rule.

## 2. Campaign-context pass before exemplar generation

Today every exemplar is generated independently, so the offer math drifts (e.g. headline promo is "double rewards til year-end" but exemplars cite plain 3%/2%).

Add an explicit **first step** the model must complete before writing exemplars, and surface it in the tool output so all 5 exemplars are forced to inherit the same numbers:

Prompt addition (new section before "Surface EXACTLY 5 examples"):

> **STEP 0 · CAMPAIGN CONTEXT (compute first, then write all 5 exemplars from it)**
> Before writing any exemplar, derive a single `campaign_context` from the headline campaigner offer + product base rates:
> - `headline_promo`: short label of the campaigner's headline offer (verbatim shape — e.g. "double rewards through Dec 31")
> - `promo_window`: end date or window phrase if stated, else null
> - `base_rates`: the product's stock category rates (e.g. `{ "primary_top": "3%", "primary_rest": "2%", "secondary": "1%" }`)
> - `effective_rates`: `base_rates` after applying `headline_promo` math (e.g. doubled → `{ primary_top: "6%", primary_rest: "4%", secondary: "2%" }`). If the promo is a flat bonus / fee waiver / APR, leave rate fields null and populate `effective_bonus` instead.
> - `top_categories`: ordered list of the top 2 qualifying PRIMARY_SPEND_CATEGORIES from cards 1/3 — these are the categories the effective top rate applies to.
>
> Every exemplar that cites a rate, $ figure, or promo window MUST use the numbers from `campaign_context` verbatim. Do not invent alternate rates. Do not use base rates when a headline promo overrides them.

Schema change in `EMIT_TOOL`:
- Add required top-level `campaign_context` object with: `headline_promo: string|null`, `promo_window: string|null`, `base_rates: object`, `effective_rates: object`, `effective_bonus: string|null`, `top_categories: string[]` (max 2).
- Add to top-level `required`.

## Out of scope
- No client/UI changes. Downstream code can read `campaign_context` later but doesn't need to today.
- No changes to other edge functions, taxonomies, or the L1–L6 playbook logic itself.