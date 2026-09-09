# Risk Filter Audit — Automated Flows

## What the audit found

Risk items in Automated Flows are exclusion filters: each has a "pass rate" (share of the triggered audience that survives), and enabled filters multiply together. Two problems show up across all 76 flows.

**1. The pass rates are far too aggressive.** They read as if someone wrote the prevalence of the risk trait instead of the share that clears the check.

Current combined pass rate by product family (all filters on):

```text
Business insurance / workers comp        3%   (0.48 x 0.31 x 0.20)
Business cards                           3.6%
Commercial mortgage                      4.2%
Personal + home insurance                6.5% - 11.6%
Business lending & deposits              7.5%
Consumer credit cards                    14.2%
Mortgage / HELOC / auto                  16.5%
529, IRA, brokerage, wealth              29%   (single "Outside the suitability range" filter at 0.29)
Personal loans                           37.4%
Checking / savings / trust / HSA         100%  (no filters at all)
```

A 529 plan losing 71% of its triggered audience to one suitability check is the clearest example, but a business insurance flow keeping 3 customers out of 100 is worse. Real bank pre-screens on a targeted, already-signal-qualified audience typically clear 55-80%.

**2. The filter assignment is uneven.** Underwritten products stack three heavy filters; deposit, trust, HSA and planning products get zero — implying no compliance screen at all. And "Thin payroll cushion" (0.05 pass, floored to 0.20) is applied to business *deposit* products where the bank takes no credit exposure.

## What should change

### A. Which risk factors apply, by product type

| Product type | Filters that should apply |
|---|---|
| Deposit / checking / savings / HSA / trust | Compliance & account-standing screen only: prior charge-off or account closed for cause, unresolved fraud or identity flag |
| Investing & retirement (529, IRA, brokerage, wealth) | No investable surplus after obligations; suitability/profile flag. Drop the single catch-all "Outside the suitability range" |
| Consumer credit cards | Payments already stretched (DTI); serious delinquency in 24 months; recent overdrafts |
| Secured lending (mortgage, HELOC, auto) | DTI; missed secured-loan payments; recent overdrafts |
| Unsecured personal lending | DTI; recent overdrafts; recent declined payments |
| Insurance | Coverage already adequate; premium affordability |
| Business credit | DTI/obligation load; thin payroll cushion; overdrafts |
| Business deposits & services | Compliance screen only — remove the payroll-cushion credit filter |

### B. How much effect each should have (proposed pass rates)

```text
Unresolved fraud / identity flag          0.97
Prior charge-off or closed for cause      0.96
Recent declined payments                  0.94
Missed secured-loan payments              0.94
Serious delinquency (24 mo)               0.93
Recent overdrafts                         0.91
Thin payroll cushion (credit only)        0.88
Carries a revolving balance               0.86
Premium affordability                     0.85
Payments already stretched (DTI)          0.82
Coverage already adequate                 0.80
Suitability / profile flag                0.90
No investable surplus                     0.74
```

Resulting combined pass rates: deposits ~93%, investing/529 ~67%, cards ~65%, secured lending ~70%, insurance ~68%, business credit ~66%. Every flow lands in a defensible 60-95% band instead of 3-100%.

### C. Guardrails so this cannot drift again

- Clamp each filter's pass rate to 0.70-0.98 at build time (today's floor is 0.20).
- Clamp the combined pass rate of a flow's filters to a 0.45 floor.
- Show the combined "clears all checks" percentage on the flow so an outlier is visible in the UI.

## Technical notes

- `RISK` seed weights and the per-product `add("risk", ...)` rules live in `src/lib/flowSignalFamilies.ts` (RISK map ~line 328, risk assignment ~line 524).
- Filters are built in `buildFlow` with `Math.min(0.98, Math.max(0.2, weight))`; the floor moves to 0.70 and a combined-rate clamp is added next to `filterPassRate`.
- New seeds needed: charge-off/closed-for-cause, unresolved fraud/identity, serious delinquency, no investable surplus, premium affordability. `cleanFraud` and `noRecentDeclines` already exist but are never assigned to any flow — they get wired in.
- `filterCascade` math and the exact-sum reconciliation stay as-is; only pass rates and assignment change.
- Verification: script that prints combined pass rate for all 76 flows and asserts every flow is within 0.45-0.98, plus a browser check of the 529 flow showing a realistic qualified count.
