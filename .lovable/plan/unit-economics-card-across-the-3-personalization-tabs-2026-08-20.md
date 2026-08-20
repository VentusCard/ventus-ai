# Unit Economics card across the 3 personalization tabs

Replace the "Reserved" placeholder in the right column of Personalized Deals, Personalized Product, and Personalized Relationship with a live **Unit Economics** card that values the surface you are looking at and accumulates a running total across all three tabs for the selected customer.

## What the user sees

Card header: "Unit economics" with an annual value **per average customer**. All three surfaces are modeled at the average-customer level (not portfolio totals), then summed.

**This surface** (changes per tab, driven by the generated content):
- Deals — incremental spend routed through the bank's rails x take rate. Default assumptions: incremental redeemed spend per customer/year, take rate ~8% (so ~$200 of directed spend ≈ $15–20 to the bank). Scales with the number of live offers generated for the customer.
- Product — conversion lift x CAC avoided. Default assumptions: recommended products x incremental conversion rate x cost of acquiring that product through normal channels (CAC), so the value is the acquisition cost the bank does not pay.
- Relationship — attrition reduction x retention/replacement cost. Default assumptions: baseline annual attrition rate, percentage-point reduction from the assisted relationship, x cost to replace that customer.

Each line renders as an explicit formula (driver x assumption x rate = value) with the assumptions visible and editable inline, so it reads as a calculation.

**Running total** (identical on all three tabs):
- Three rows, one per surface: Deals / Product / Relationship, each with its per-average-customer contribution and a state marker (counted, or "not generated yet" until that tab's data exists).
- Total annual value per average customer = sum of the three.
- Optional portfolio line: per-customer total x portfolio size (default 1,000,000, editable inline) → annualized program value.


Before a customer is selected the card shows the same dashed empty state as the rest of the workspace.

## Behavior

- Values derive from the already-generated results for the selected customer (offer count, product-card count, signal counts), so the number moves with the customer and with what the LLM returned.
- Contributions accumulate in a shared session store keyed by customer, so switching tabs keeps the total; switching customers recomputes.
- Deals and Product contributions become available as soon as their generation lands (progressive), matching current rendering; the relationship contribution is signal-derived and available immediately.
- No new network calls, no LLM — pure deterministic math from existing data.

## Technical notes

- New `src/lib/personalizationUnitEconomics.ts`: assumption constants per surface, `computeSurfaceEconomics(surface, customer, entry)`, and a small `useSyncExternalStore` store holding the per-customer contribution map plus the editable portfolio size.
- `SurfaceFeaturePanel.tsx`: swap the Reserved block for a new `UnitEconomicsCard` component (new file under `personalization/`), taking `surface` and reading the selected customer + `personalizationResultStore` entry.
- Keep the existing "Key features" card unchanged; layout stays the two stacked cards in the third column.
- Strict light theme, existing slate/blue token styling, no dark: utilities.
