# Remove Business-Only Flows from /bankdemo

We only ingest consumer transaction data, so dedicated business products don't belong in the catalog. The one exception the user called out: detecting that a consumer is *starting or running* a business from their personal-account activity — that signal stays and continues to drive **Small Business Loan**.

## Remove these flows entirely
From `src/lib/productAutomatedFlows.ts` and `src/lib/productMicrosegments.ts`:
- `sb-cashback-card` — Small Business Cash Back Card
- `sb-flat-card` — Small Business Flat-Rate Card
- `sb-travel-card` — Small Business Travel Card
- `equipment-financing` — relies on commercial lease ACH / practice payroll, which we don't see on consumer accounts

## Keep, but reframe signals around personal-account evidence
- `small-business-loan` — Small Business Loan
  - Keep all current signals (Square/Stripe deposits into personal account, vendor ACH cluster, business-pattern card use on personal card). These already match the "running a business from a personal account" detection the user wants.
  - No microsegment changes needed; existing copy already speaks to the side-hustle / solo-operator consumer.

## Touch nothing else
- 32 remaining flows untouched.
- No UI/component changes; `ProductAutomatedFlowsView` keeps rendering whatever `PRODUCT_FLOWS` exposes.

## Files
- `src/lib/productAutomatedFlows.ts` — delete 4 flow objects
- `src/lib/productMicrosegments.ts` — delete the 4 matching keys
