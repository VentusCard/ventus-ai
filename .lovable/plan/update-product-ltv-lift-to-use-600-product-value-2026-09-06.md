# Update Product LTV lift to use $600 product value

## Goal
Recompute the Product surface's "Anticipated LTV Lift" headline so it reflects profit from a $600 product value at the existing 4% conversion rate, replacing the current acquisition-cost-avoided assumption.

## What you'll see
- In the Personalized Product tab, the LTV Lift sliver headline changes from **+$17 / customer / yr** to **+$24 / customer / yr**.
- The supporting math lines stay structurally the same but now reference the $600 product value and 4% conversion.
- The driver hint still reads from the live recommended-product count (e.g., "driven by N recommended products").

## Technical details
- Edit `src/lib/personalizationLtvLift.ts`:
  - In the `surface === "product"` branch, replace `cacAvoided = 420` with `productValue = 600`.
  - Keep `productConversion = 0.04`.
  - Compute `value = productValue * productConversion` → $24.
  - Update supporting lines:
    - "Expected conversion per recommendation" → 4%
    - "Product value per conversion" → $600
    - "Anticipated lift / customer / yr" → +$24
- No UI component changes are required; `LtvLiftSliver.tsx` already consumes the result.

## Acceptance criteria
- Product tab LTV Lift displays +$24 / customer / yr.
- Supporting lines show $600 product value and 4% conversion.
- Typecheck and build pass; no console errors on `/bankdemo`.
