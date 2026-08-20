# Unit Economics: per-customer only

Remove the portfolio-size multiplication from the Unit Economics card so all values stay strictly per average customer.

## Changes

1. **Assumptions model** (`src/lib/personalizationUnitEconomics.ts`)
   - Remove `portfolioSize` from `EconomicsAssumptions` and `DEFAULT_ASSUMPTIONS`.

2. **Card UI** (`src/components/tepilot/insights/personalization/UnitEconomicsCard.tsx`)
   - Delete the "× {portfolioSize} customers" annualized program line.
   - Remove `portfolioSize` from `ASSUMPTION_FIELDS`.
   - Keep the header showing the per-customer total.

3. **Running total block**
   - Retain "Total / average customer" as the final line.
   - No portfolio multiplier or annualized program value.

## Outcome

The card shows only:
- This surface value and formula lines (per average customer / year).
- Running total of Deals + Product + Relationship (per average customer / year).
- Editable assumptions for the per-customer math only.
