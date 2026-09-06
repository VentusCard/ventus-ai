# Stack CAC + product economics in Product LTV lift

## Goal
Update the Personalized Product tab's "Anticipated LTV Lift" so the headline reflects both acquisition cost avoided and product value, stacked together.

## What you'll see
- Product tab LTV Lift headline changes from **+$24 / customer / yr** to **+$41 / customer / yr**.
- Expanded supporting lines show the two inputs and the combined math:
  - CAC avoided per conversion: $420
  - Product value per conversion: $600
  - Combined value: $1,020
  - Expected conversion: 4%
  - Anticipated lift: +$41
- Driver hint still reads from live recommended-product count.

## Technical details
- Edit `src/lib/personalizationLtvLift.ts`:
  - In the `surface === "product"` branch keep `productConversion = 0.04`.
  - Add `cacAvoided = 420` and `productValue = 600`.
  - Compute `stackedValue = cacAvoided + productValue` and `value = productConversion * stackedValue` → $40.80, rounded to $41.
  - Update `lines` to:
    - "CAC avoided per conversion" → $420
    - "Product value per conversion" → $600
    - "Combined value per conversion" → $1,020
    - "Expected conversion per recommendation" → 4%
    - "Anticipated lift / customer / yr" → +$41
- No UI component changes needed.

## Acceptance criteria
- Product tab LTV Lift displays +$41 / customer / yr.
- Supporting lines show $420 CAC, $600 product value, $1,020 combined, 4% conversion, and +$41 lift.
- Typecheck and build pass; no console errors on `/bankdemo`.
