Remove the hyper-personalized savings/value line from in-collection deal cards

## Goal
Stop showing the "Save $X on ... based on your $Y annual spend" line inside each generated deal card in the phone mockup's collection/detail view.

## Current state
In `src/components/exec-demo/GeneratedOffersPhoneView.tsx`, the deal detail card renders `deal.valueLine` as a green-emphasized block:

```tsx
{deal.valueLine && (
  <p className="... bg-emerald-50 border border-emerald-100 ...">
    <span className="text-emerald-600 mr-0.5">$</span>{deal.valueLine}
  </p>
)}
```

This produces copy like: "$Save $95 on premium court gear based on your $6,400 annual tennis spend."

## Change
Remove the `valueLine` rendering block from the deal detail card in `GeneratedOffersPhoneView.tsx`. Keep the `deal.message` (contextual benefit copy) and the reward/CTA elements intact.

The `valueLine` and `valueMath` fields in the data layer (`personalizationSnapshots.ts`, `NextOfferRationale.tsx` types) are left untouched so other views or future uses remain unaffected.

## Verification
- Open a personalized tab in `/bankdemo`, select a customer, and open a deal collection.
- Confirm each deal card shows merchant, product, message, reward pill, and CTA — but no green savings/value math line.
