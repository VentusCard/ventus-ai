## Goal
Make it explicit across `/pricing` that the Pilot package is a **6-month** engagement (currently labeled "/yr" or unlabeled).

## Changes — `src/pages/Pricing.tsx`

1. **Step 1 pilot pill** (line ~197–207): change suffix from `customers` → `customers · 6 months`. Add an `6-month pilot` eyebrow label instead of `Pilot size`.

2. **Pilot button tooltip** (line 188): change `${formatCurrency(pilot.flatFee)} / yr` → `${formatCurrency(pilot.flatFee)} flat for 6 months`.

3. **Step 2 column header** (line ~231–236): change header `Pilot/yr` → `Pilot (6mo)`. Subtitle stays `6 Month`.

4. **Merged pilot cell** (line ~311–313): change subtitle `Flat · all modules` → `Flat · 6 months · all modules`.

5. **Totals strip pilot label** (line ~327–333): change visible label from `Pilot` → `Pilot (6mo)`.

6. **Email/copy summary text** (line ~66–73): change `Pilot option: … / yr flat` → `6-month pilot: {customers} customers · all modules · {flatFee} flat (6 months)`.

No changes to `pricingCatalog.ts` (the `flatFee` value is already conceptually the 6-month price — we are only relabeling, not recomputing). No structural/layout changes.
