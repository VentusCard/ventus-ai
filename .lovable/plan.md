

## Plan: Category-Level Signal Pills in Rollup Headers

### Goal
Replace brand-name suppressed pills with **category-level signal pills** that tell the story: what's already covered (✓ Hotels, ✓ Airlines) and what the opportunities are (↑ Headphones, ↑ Luggage). This makes the header a quick legend for the deals below.

### Changes

**1. `supabase/functions/generate-next-offers/index.ts`** — Update the prompt and output schema:
- Add `suppressedCategory` field to suppressed deals (e.g., "Hotels" not "Marriott")
- Add `boostCategory` field to boosted deals (e.g., "Headphones" not "Sony WH-1000XM5")
- Prompt instructs AI: suppressed items use broad category labels, boosted items use short product-type labels

**2. `src/components/exec-demo/NextOfferRationale.tsx`** — Add boost pills alongside suppressed pills in the header:
- Suppressed pills: gray with `✓` checkmark + category label (e.g., `✓ Hotels`)
- Boosted pills: light green with `↑` arrow + category label (e.g., `↑ Headphones`)
- Neutral deals get no pill — only suppressed and boosted show in the header
- Deduplicate pills when multiple deals share the same category

Result per rollup card header:
```text
✦ Frequent Traveler  ✓ Hotels  ✓ Airlines  ↑ Headphones  ↑ Luggage
[deal tiles below...]
```

### No other files change

