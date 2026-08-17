# Signal audit: relevance + plain language

## Problems found

**1. Risk signals attach where they don't belong.** In `src/lib/flowSignalFamilies.ts`, `supplementalFor()` always adds `RISK.stableTenure`, and backfills `RISK.cleanFraud` whenever a flow has fewer than 2 risk signals. That means a savings account, a rewards card upgrade, or a travel perk flow all get "Clean fraud & dispute history" — a signal that has nothing to do with whether someone wants that product. `RISK.collateralClean` is attached to every card flow even though cards are unsecured, and `suitability` lands on every deposit-adjacent investment match.

**2. Language is underwriting jargon, not plain English.** Examples currently shown to a banker in the UI:

```text
Healthy debt service ratio      → "observed debt-service outflow comfortably below underwriting thresholds"
Low revolving utilization       → "statement balances stay under a third of available revolving lines"
Collateral-ready profile        → "no servicer delinquency markers"
Suitability screen clear        → "meet the product's suitability floor"
Idle cash above operating needs → "non-interest balances above 3 months of observed outflow"
Rate-seeking transfers out
Business revenue settlements
```

## What changes

### A. Risk family only where credit is actually extended

Risk becomes an **eligibility** family that appears only on products that are underwritten or funded: lending, mortgage/HELOC, auto, cards, business credit, securities-based lending, insurance.

- Remove the unconditional `add("risk", RISK.stableTenure)` and the `< 2` cleanFraud backfill.
- Deposits, rewards, travel perks, gamification-style and pure-advisory flows get **zero** risk signals rather than filler.
- Secured-only signals (collateral) restricted to home/auto/secured lending; cards get card-relevant eligibility instead.
- Insurance gets a coverage-gap eligibility signal rather than a credit one.

### B. Same relevance pass on the other families

- `interestSeeking` ("rate-seeking transfers out") stays on savings/CD/HYSA only, not on every deposit-tagged product.
- `multiVehicle` only on auto/insurance, not on anything matching `car` in its positioning text.
- `payroll` no longer added to every single flow; it stays where income stability actually matters (lending, deposits, insurance).
- The `< 2` financial and demographic backfills are replaced with product-appropriate defaults instead of always `surplus` / `dualIncome`.

### C. Rewrite every label and evidence line in plain language

Rule: a label is what a branch banker would say out loud; evidence is one sentence naming what was seen in the account.

```text
BEFORE  Healthy debt service ratio
        Observed debt-service outflow comfortably below underwriting thresholds for income.
AFTER   Comfortable room for a new payment
        Their existing loan and card payments take up a small share of what comes in each month.

BEFORE  Low revolving utilization
AFTER   Barely uses their credit limit
        Card balances stay well under the limit every month.

BEFORE  Idle cash above operating needs
AFTER   Cash sitting still
        More in checking than they spend, month after month, earning nothing.

BEFORE  Business revenue settlements
AFTER   Gets paid by customers through card sales
        Regular payouts from a card processor land in the account.

BEFORE  Suitability screen clear
AFTER   Fits the profile for this product
        Savings and steady income are in the range this product is meant for.
```

Every entry in `FINANCIAL`, `DEMOGRAPHIC`, `RISK`, `EXTRA_BEHAVIORAL` and `EXTRA_LIFE_EVENT` is rewritten this way. No acronyms (DTI, NSF, ACH, 1099 spelled out as "self-employed"), no "observed", "trailing 90 days" becomes "the last three months".

### D. Authored product signals

The life-event and behavioral signals authored per product in `src/lib/productAutomatedFlows.ts` get the same readability pass — any that read as internal shorthand are reworded. Product coverage, ordering, audience math and the toggle UI are unchanged.

## Technical notes

- Files touched: `src/lib/flowSignalFamilies.ts` (seed libraries + `supplementalFor` gating), `src/lib/productAutomatedFlows.ts` (signal label/evidence copy only).
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` is not restructured; flows that now carry no risk signal simply render fewer rows.
- Signal `id`s derive from labels via `slug()`, so renames change ids — since enabled-state is session-only and defaults to all-on, nothing breaks.
- Weights are revisited only where a signal is removed, so each flow's audience still distributes sensibly.
- Mock data only; no backend calls, no schema change. Strict light theme untouched.
