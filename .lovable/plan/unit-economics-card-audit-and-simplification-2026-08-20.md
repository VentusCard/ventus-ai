# Unit Economics card — audit and simplification

## What the card does today

The card lives in the right column of all three personalization tabs (Deals, Product, Relationship). It shows three blocks: "This surface", "Running total", and a collapsible "Assumptions" panel.

Audit findings from the current implementation:

1. **Deals math is over-explained and inflated.** The offer count sums every deal in every generated group, so a customer shows ~25 "live offers". At $200 incremental spend each that implies $5,000 of directed spend per customer per year — not credible, and the two-step breakdown ("Directed spend", then "Bank take rate") makes the card read like a spreadsheet.
2. **Every surface renders a two-line intermediate formula**, so the card is dense in all three tabs, not just Deals.
3. **The Relationship line uses an invented signal multiplier** (`0.6 + signals × 0.06`, capped at 1.6×) layered on top of the attrition assumption. It is not explainable in a demo and is not one of the drivers the model is supposed to expose.
4. **Mixed live and stale values in the running total.** Values are cached per customer per surface; once recorded they persist even if a later regeneration changes them, so the total can disagree with the surface block above it.
5. **The header total is always shown**, even when only one surface has generated, which reads as a complete figure when it is partial.

## Changes

### Deals (primary ask)
- Show only two numbers: **Total deals spend** and **Bank take** — no offers-times-spend line, no percentage restatement.
- Base directed spend on a realistic per-customer annual figure rather than raw offer count × spend, so the number stops scaling with how many cards the generator happened to return. Keep it driven by an editable assumption.

### Product and Relationship (for consistency)
- Collapse each to the same two-line shape: the driver amount and the value to the bank.
- Product: incremental conversions → CAC avoided.
- Relationship: attrition avoided → retention cost saved.
- Remove the signal-count multiplier from the relationship formula; use the plain base attrition × reduction from the assumptions.

### Running total and header
- Recompute contributions from live data when available and drop stale cached values that no longer match.
- Label the header total as partial until all three surfaces have generated.

## Technical notes
- `src/lib/personalizationUnitEconomics.ts` — rework `computeSurfaceEconomics` line output for all three surfaces, adjust the deals driver, remove the signal multiplier, keep `EconomicsAssumptions` editable.
- `src/components/tepilot/insights/personalization/UnitEconomicsCard.tsx` — simplify the "This surface" block rendering, adjust running-total/header labeling.
- No backend, edge function, or LLM changes.

## Acceptance
- Deals tab shows just total deals spend and bank take, per average customer, with a believable spend figure.
- Product and Relationship follow the same two-line pattern.
- Assumptions panel still re-models all values live; reset still works.
- Running total never shows a value that contradicts the surface block currently on screen.