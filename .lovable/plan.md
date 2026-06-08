## Goal
Change "Refine Audience (Optional)" to always show the full canonical filter set. Instead of hiding facets/options not in `applicableDemographics`, render everything and **pre-select** the values the edge function returned as applicable.

## Frontend — `src/components/tepilot/campaigns/DemographicFilters.tsx`
- Remove the option-filtering and facet-hiding logic driven by `applicable`. Always render all four facets with their full canonical lists (`AGE_RANGES`, `REGIONS`, `INCOME_BANDS`, `ACCOUNT_TENURE_OPTIONS`).
- Keep the `applicable` prop on the type signature (still accepted) but no longer use it to filter what's rendered. Pre-selection is handled by the parent setting `filters`.
- Drop the early `return null` when all facets are empty.

## Frontend — `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`
- After a successful `generate-lifestyle-signals` response, **pre-select** the returned demographics into the `DemographicFilters` state instead of using them to gate visibility:
  - `ageRanges` ← `applicableDemographics.ageRanges` (intersected with canonical `AGE_RANGES`)
  - `regions` ← `applicableDemographics.regions` (intersected with canonical `REGIONS`)
  - `incomeBands` ← `applicableDemographics.incomeBands` (intersected with canonical income band values)
  - `accountTenure` ← first value of `applicableDemographics.accountTenure` if present, otherwise `'all'` (the Select is single-value)
- On product change, reset filters back to empty arrays / `'all'` before regenerating.
- Stop pruning user selections against `applicableDemographics` on subsequent generations — once the user has interacted, leave their picks alone; only the fresh-generation step writes pre-selections.
- Keep passing `applicableDemographics` to `DemographicFilters` for now (no-op in the child) or drop the prop — choose drop to keep the surface clean.

## Out of scope
Edge function changes (it keeps returning `applicableDemographics`), other campaign builder sections, other consumers of `DemographicFilters`, audience-size estimator.

## Validation
- Travel Rewards Card → Generate → Refine Audience shows ALL facets; Age Ranges has `25-34 / 35-44 / 45-54` pre-selected, Income Bands has `$100K–$150K / $150K+` pre-selected, Regions none, Tenure = All Tenures.
- 529 Plan → Generate → all facets visible; Age Ranges pre-selects `25-34 / 35-44`; Income Bands pre-selects `$50K–$100K / $100K–$150K / $150K+`.
- Small Business Loan → all facets visible; Account Tenure pre-selects `Established` (or `Loyal`); other facets empty but still visible so the user can add.
- Switching products clears prior selections before applying the new pre-selection.
