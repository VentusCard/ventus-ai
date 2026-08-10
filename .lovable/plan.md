# Customers tab — banker-facing customer directory

Add a new **Customers** tab in the *Customer Intelligence* sidebar group of /bankdemo, where a banker can search for a specific customer and see the five signal families Ventus AI picked up for that person.

## What the banker sees

1. **Search + directory (left)**
   - Search box (name, email, city, segment, or signal keyword).
   - Filter pills for signal family presence (Life Events, Financial, Spending Habits, Demographic, Risk).
   - Scrollable list of 15 mock customers: name, tier/segment, city, relationship value band, and a compact row of signal-count chips.

2. **Customer detail (right)**
   - Header: name, age band, segment/tier, tenure, primary products, last activity.
   - Five signal sections in the standard priority ladder order used elsewhere in the demo:
     1. Life Events
     2. Financial Signals
     3. Spending Habits
     4. Demographic Signals
     5. Risk
   - Each signal renders as a pill/card with the label, a vaguely-specific evidence line (no exact spend totals or transaction counts), and a confidence band.
   - Footer strip: 2–3 suggested next actions (product, deal, or conversation) consistent with the demo's tone.

Selecting a customer from the list swaps the detail panel; the first customer is selected by default.

## Mock data

15 diverse customers spanning life stages and segments (new parent, college-prep household, relocating professional, small-business owner, pre-retiree, frequent traveler, new pet owner, first-time homebuyer, high-net-worth investor, gig-income earner, recent graduate, empty nester, multi-property owner, subscription-heavy household, credit-rebuilding customer). Each carries 3–8 signals distributed across the five families, with mutually exclusive assignment (e.g. pet spending only in Spending Habits, auto/mortgage/investment only in Financial Signals).

## Technical notes

- New file `src/lib/customerDirectoryData.ts` — typed mock dataset (`DirectoryCustomer` with `lifeEvents`, `financialSignals`, `spendingHabits`, `demographicSignals`, `riskFlags`), reusing the existing signal vocabulary in `financialSignalTaxonomy.ts` where applicable.
- New file `src/components/tepilot/insights/CustomersDirectoryView.tsx` — `TabHeader` + two-column split (list / detail), local search + filter state, strict light theme (white, slate-200 borders, no `dark:` utilities), Manrope UI type.
- `AnalyticsContainer.tsx`: add `'customers'` to `TabValue`, add the nav item with a `Users`-style icon to the *Customer Intelligence* group (order: Dashboard, Customers, Reports & Query, Risk), and render the new view.
- Pill colors follow the existing pillar palette; red reserved for risk only.
