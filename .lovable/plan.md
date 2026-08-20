# Simplify Deals unit economics card

## Goal
Reduce the Deals section of the Unit Economics card to only two per-customer numbers: total deals spend and bank take. Remove the intermediate step-by-step math that currently shows "25 offers × $200 incremental spend".

## Changes

1. Update `src/lib/personalizationUnitEconomics.ts`
   - In `computeSurfaceEconomics` for the `"rewards"` surface, replace the two-line breakdown (`Directed spend` + `Bank take rate`) with two concise lines:
     - **Total deals spend** — the full directed spend amount (`offers * spendPerOffer`).
     - **Bank take** — the bank's share (`directedSpend * takeRate`).
   - Keep the same formula inputs and assumptions; only the labels and displayed math change.

2. Update `src/components/tepilot/insights/personalization/UnitEconomicsCard.tsx`
   - Render the new labels without the verbose "× $200 incremental spend" copy.
   - Keep the running total and assumptions sections unchanged.

## Out of scope
- Product and Relationship surfaces stay as-is.
- Assumption editing and running-total behavior stay as-is.
- No backend or LLM changes.

## Acceptance
- On the Personalized Deals tab, the Unit Economics card shows only "Total deals spend" and "Bank take" for the current customer.
- Values remain per-average-customer and still update when assumptions change.