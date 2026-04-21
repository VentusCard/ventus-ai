

## Problem

Pill **"Annual Premium Hawaii Vacations"** is including a **PALISADES TAHOE LODGE** transaction. That's a semantic mismatch — Hawaii vacations and ski lodging are two different lifestyles, even though both fall under "Hotels & Lodging" in the category taxonomy.

The pill labels are correct and should stay vivid ("Annual Hawaiian Vacations" is exactly the style the user wants). The fix is teaching the LLM that **the transactions placed inside a rollup must semantically match the rollup's meaning** — not just share a category code.

## Root cause

`synthesize-persona` groups transactions by `pillar::category` and sends each category as a single row `[N]` to the AI. The AI picks `category_indices` to bundle into a rollup. Because all hotel charges live in one category row, picking that index pulls in *every* hotel — Hawaii beach resorts and Tahoe ski lodges alike.

Two things must change in the prompt to fix this semantically:

1. The AI must **inspect merchants/subcategories** before picking a category index — not just the category name.
2. The AI must understand that **a category may contain multiple distinct lifestyles**, and in that case it should either split them into separate rollups or omit the category from a rollup whose theme it doesn't fully match.

## Fix — prompt-only, in `supabase/functions/synthesize-persona/index.ts`

Add a single, strong **semantic-coherence rule**. Keep all existing destination-named labels and examples.

### New rule to add (after the existing "Pattern-forward naming" section)

> **SEMANTIC COHERENCE — TRANSACTIONS INSIDE A ROLLUP MUST MATCH ITS MEANING.**
>
> A rollup is not just a label — it's a *promise* about what kind of activity the contributing transactions represent. Before you add a category index to a rollup, look at the merchants and subcategories listed for that index and ask: "**Do these specific purchases actually fit the lifestyle this rollup describes?**"
>
> Categories like "Hotels & Lodging" or "Airlines" routinely mix incompatible lifestyles. A single "Hotels & Lodging" row can contain a Hawaii beach resort, a Tahoe ski lodge, and a midtown business hotel — those are **three different lifestyles**, not one. You must NOT bundle them under a single rollup just because they share a category.
>
> Examples of forbidden mismatches:
> - "Annual Hawaiian Vacations" must NOT include `PALISADES TAHOE LODGE`, `ASPEN MOUNTAIN`, `VAIL RESORTS` — those are ski-trip merchants, not Hawaii.
> - "Seasonal Ski Trips" must NOT include `MAUI HILTON`, `KONA VILLAGE`, `HAWAIIAN AIRLINES` — those are tropical-trip merchants, not skiing.
> - "Premium Fine Dining Nights" must NOT include `MCDONALD'S` or `CHIPOTLE` even if they live in a "Restaurants" category.
>
> **What to do instead:**
> 1. Read every merchant and subcategory in each candidate category.
> 2. If a category cleanly matches one lifestyle, include its index in that rollup.
> 3. If a category contains **mixed lifestyles** (some Hawaii, some Tahoe; some fine dining, some fast food), emit **separate rollups** for each coherent sub-pattern (e.g. "Annual Hawaiian Vacations" AND "Seasonal Ski Trips"), each pointing to the same category index — the UI will use merchant-level signals to display the right transactions under each pill. Do not silently merge incompatible lifestyles to keep your output shorter.
> 4. If a single lifestyle clearly dominates (e.g. 6 Hawaii merchants and 1 stray ski lodge), name the rollup after the dominant lifestyle and accept that the stray transaction belongs to a separate, ungrouped behavior — do **not** stretch the label to cover both.
>
> When in doubt, emit fewer, more honest rollups. A coherent "Annual Hawaiian Vacations" pill with only Hawaii merchants is worth more than a bloated "Premium Travel" pill that lumps everything together.

### Supporting tweak

In the existing "How to think about rollups" intro, add one line at the top:

> Before you write any rollup, scan the merchants in each category — they're your ground truth. Category names lie; merchants don't.

Keep all existing destination-named examples ("Annual Hawaiian Vacations", "Winter Ski Trips", "Tennis & Ski Seasonal Sports", etc.) intact.

## Files Changed

- `supabase/functions/synthesize-persona/index.ts` — system prompt only (no schema, no code, no client changes)

## Verification

- /demo → run a customer with both Hawaii and Tahoe travel
- Expect two coherent pills: **"Annual Hawaiian Vacations"** and **"Seasonal Ski Trips"** (or similar)
- Open "Annual Hawaiian Vacations" → must contain only Hawaii-themed transactions; no Tahoe/Aspen/Vail
- Open "Seasonal Ski Trips" → must contain only ski-themed transactions; no Maui/Kona/Hawaiian Air
- Generic merchants (Marriott, Delta) without a clear destination signal stay out of destination-named rollups unless context establishes the destination

