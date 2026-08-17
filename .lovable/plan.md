# Plan: Risk Filters — Red Label, Negative Numbers, Exclusion Language

## Goal
Eligibility filters in the Automated Flows tab should read unmistakably as risk filters: a red "Risk Filter" label, numbers shown as negative impact, and copy that describes who gets *removed* rather than who passes.

## 1. Red "Risk Filter" label
In `ProductAutomatedFlowsView.tsx` (`FilterRow`):
- Replace the grey `Filter` badge with a red `Risk Filter` badge (`bg-rose-50 text-rose-700 border-rose-200`).
- Switch the `ShieldCheck` icon usage in the filter header and flow summary to a risk-toned red icon so the section color matches the badge.
- Update the risk family color token in `flowSignalFamilies.ts` from slate to the same rose palette for consistency.

## 2. Numbers become negative
- Filter row right column: replace `Keeps 78%` with `-22%` (computed as `1 - passRate`), rendered in red.
- Add the people impact on each filter row / detail: `-1.2K people` — the audience that filter removes from the triggered pool.
- Flow-level filter header: replace `keeps N%` with the combined `-X%` and `-N people` removed (`triggered - qualified`).
- Keep the "Qualified audience" total line so the arithmetic still reads Triggered → minus filters → Qualified.

## 3. Audit and rewrite all filter descriptions (the main copy work)
Today the risk items are worded as compliments ("Never overdraws the account", "Pays their secured loans on time"), which contradicts a negative-impact filter. Rewrite every risk seed in `flowSignalFamilies.ts` so the label names the *exclusion* and the evidence explains who is dropped:

| Current | Becomes (label / what it removes) |
| --- | --- |
| Never overdraws the account | Recent overdrafts — removes anyone who overdrew or bounced a payment in the last 3 months |
| Comfortable room for a new payment | Payments already stretched — removes anyone whose loan and card payments eat too much of monthly income |
| No fraud or disputes on file | Fraud or dispute history — removes accounts with a fraud claim or disputed charge in the past year |
| No declined payments | Recent declined payments — removes anyone with card or bank payments turned down in the last 2 months |
| Pays their secured loans on time | Missed secured-loan payments — removes anyone behind on a mortgage or car loan |
| Pays the card off every month | Carries a revolving balance — removes anyone rolling a balance or paying late |
| Enough cash to cover payroll | Thin payroll cushion — removes businesses ending the month under one payroll run |
| Fits the profile for this product | Outside the suitability range — removes households whose savings or income fall outside what this product is built for |
| Looks under-insured | Coverage already adequate — removes households whose coverage already tracks their income and assets |

Also audit the surrounding explanatory copy:
- Section heading: "Eligibility filters — narrow who qualifies" becomes "Risk filters — each one removes customers from the triggered audience".
- Expanded filter detail: replace "Roughly N% of the triggered audience clears it" with "Removes about X% (N people) from the triggered audience — a guardrail, never a trigger."
- Flow header chip: "N of M filters" stays, but the tone/icon becomes risk-red.
- Verify no other view reuses the risk family label as a *signal* (the risk family is filters-only), and confirm the plain-language rule holds — no jargon like DTI, utilization, ACH.

## Files touched
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
- `src/lib/flowSignalFamilies.ts`

## Validation
Open `/bankdemo` → Automated Flows, expand a Lending flow (multiple filters), a Card flow, an Insurance flow, and a Savings flow (no filters). Confirm red "Risk Filter" badges, negative percentages and people counts, exclusion-worded descriptions, and that toggling a filter changes the qualified audience by the stated negative amount.
