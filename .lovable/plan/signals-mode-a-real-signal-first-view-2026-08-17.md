# Signals mode: a real signal-first view

Today the Signals toggle only re-filters the same product rows. It should flip the entire tab to a signal-first view built on the full taxonomy shown in the Systems tab, not on the two authored types.

## Full signal list (from the Systems tab)

Five families, 56 detected signals total:

- Behavioral (11): the 11 lifestyle pillars — Sports & Active Living, Food & Dining, Travel & Exploration, Home & Living, Style & Beauty, Health & Wellness, Technology & Digital, Family & Community, Pets, Entertainment & Culture, Trip Reconstruction.
- Life Event (9): Home Purchase, New Baby, Wedding / Engagement, College Prep, Business Formation, Elder Care, Retirement Planning, Relocation, Inheritance / Windfall.
- Financial (9): active payroll deposit, recent large inflow, deposit balance trending up, investable assets tier, funds external brokerage, active mortgage payer, low credit utilization, healthy DTI, subscription stack load.
- Demographic (13): likely homeowner, parent of young children, parent of school-age, dual-income, pre-retiree / empty nester, self-employed, small business owner, multi-property, rental income earner, dependents in college, high-net-worth indicator, recently relocated, beneficiary reasoning.
- Risk (14): the vice, distress, and AML detectors (adult entertainment through AML cross-border wires), each with its severity weight.

## What Signals mode becomes

- Pills switch to the five families (plus All), counted by number of signals in that family.
- The row list switches from products to **signal rows**. Each row shows: family color dot, signal name, its detection basis (the Systems-tab sublabel, e.g. "Mortgage, Home Depot/Lowe's, HOA fees"), the number of product flows it feeds, an estimated audience, and the same active/inactive switch semantics (a signal is on when at least one flow it feeds is on; toggling it flips those flows).
- Expanding a signal row reveals the product flows it triggers — compact cards showing product name, category badge, audience, and its own switch — so the demo reads "this signal fires these products", the inverse of the product view.
- Risk signals additionally show their severity weight badge.
- Sorting is by audience descending inside a family, and by family order (Behavioral, Life Event, Financial, Demographic, Risk) in the All view.
- Products mode is untouched.

## Technical

- New `src/lib/signalTaxonomy.ts` exporting the 56 signals as `{ id, family, label, detection, weight?, productIds[] }`, with family label/color reused from `productAutomatedFlows.ts`. The Systems tab keeps its own presentation but the taxonomy content is sourced from this file so the two stay in sync.
- `productIds` is an authored mapping from each signal to the flows in `PRODUCT_FLOWS` it plausibly triggers (e.g. "Parent of school-age" to 529 / student cards / life insurance; "Small business owner" to the business-owner flows). Signal audience = sum of distinct flow audiences it feeds, capped for realism.
- `ProductAutomatedFlowsView.tsx` renders a `SignalRow` list in Signals mode; the existing `FlowRow` component is reused in condensed form for the nested flows. The per-flow `active` Set stays the single source of truth for both modes.
- `CapabilitiesView.tsx` SIGNALS items switch to reading labels/sublabels from the shared taxonomy, keeping its existing visuals.
