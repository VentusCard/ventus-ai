## Goal

The "Bank Context" tab (currently `ProductsCatalogView`, showing only the product catalog) should mirror the six-part definition of Bank Context that already appears under the "System" tab source card:

> Consumer Banking Products · Consumer Lending Products · Wealth & Investment Products · Locations & Hours · Departments · Customer Segments & Tiers

We'll restructure the tab into a sub-tabbed detail view so each facet is browsable, and rename it to make the scope clear.

## New sub-tab structure

Inside the Bank Context tab, add a segmented sub-nav with 4 sub-tabs (Products already covers the three product buckets from the source card via its existing categories):

1. **Products** — existing `BANK_PRODUCT_CATEGORIES` grid (Consumer Banking, Lending, Wealth & Investment all live here as categories). Keeps current UI.
2. **Locations & Hours** — branch network, ATM coverage, regional operating schedules. Simple stat tiles + a table of sample regions (Northeast/Southeast/Midwest/Southwest/West/Northwest) with branch count, ATM count, weekend hours.
3. **Departments** — RM assignment rules, advisor specializations, escalation paths. Card list: Retail RM, Small Business, Wealth Advisor, Private Bank, Mortgage Loan Officer, Fraud/AML — each with coverage tier, escalation path, specialization.
4. **Customer Segments & Tiers** — Mass Market, Preferred Rewards (Gold/Platinum/Platinum Honors/Diamond), Merrill, Private Bank. Table with balance thresholds, benefits, servicing model.

All three new sub-tabs use presentation-only mock data hand-authored in the same file (or a small sibling data file), following the existing card/table look — no business-logic changes, strict light theme, Manrope UI.

## Files to change

- `src/components/tepilot/insights/ProductsCatalogView.tsx`
  - Rename component to `BankContextView` (keep file or rename to `BankContextView.tsx`).
  - Add internal `subTab` state and a segmented control (same visual language as other in-page tabs — slate-200 border pill row).
  - Render existing catalog for the Products sub-tab; render three new sub-views for the others.
  - Update `TabHeader` title to "Bank Context" and rewrite subtitle/howItWorks/whyItMatters to cover all four facets, not just products.

- `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Update the import and `case 'products'` render to the renamed view (if renamed).
  - Nav label already reads "Bank Context" — no change.

- `src/components/tepilot/insights/CapabilitiesView.tsx`
  - Update the Bank Context source card's `openLabel` from `Open Products tab · N products` to `Open Bank Context tab`, since it now covers more than products.

## Out of scope

- No changes to `bankProductCatalog.ts` or any downstream consumer of it.
- No new routes, no backend/data-model changes.
- Locations, Departments, and Segments data is static illustrative content only.
