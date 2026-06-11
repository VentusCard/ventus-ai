## Goal

Restructure Sections 1 and 2 of the Campaign Builder so Step 1 is a clean "pick a product → see full addressable population" view, and Step 2 becomes the consolidated filtering step.

## Step 1 — `ProductPickerSection.tsx` (simplify)

- Remove the entire right-hand column: Filters collapsible (Age / Income / FICO / Region / Tenure / Relationship) **and** the `AudiencePanel` reach calculator.
- Remove related local state (`filtersOpen`, `filters`, `setFilters`, `DEFAULT_FILTERS`, `activeCount`, `tenureFactor`, `depthFactor`, `groupRatios`, `retention`, `estimatedReach`, `tightest`, `toggleArr`) and the helper components `AudiencePanel` / `ChipGroup`.
- Remove now-unused imports (`AGE_RANGES`, `REGIONS`, `INCOME_BANDS`, `ACCOUNT_TENURE_OPTIONS`, `FICO_RANGES`, `Select*`, `ChevronDown`, `ChevronRight`, `Filter`, `cn`).
- Layout becomes a single column. When a product is selected, render the existing selected-product card at full width, and add a slim "Addressable population" strip directly beneath it showing `{fmt(product.estimatedAudience)}` with the label "Total eligible customers for this product" (no filters applied — this is the raw audience baseline).
- When no product is selected, keep the existing search input at full width.

## Step 2 — `ExclusionFunnelSection.tsx` (becomes the filter step)

- Rename the header from "Audience & signal contributions" to "Filter the audience" and update the subtitle/badge to reflect filtering, not just signal contribution. Keep the right-side badge showing `{eligible} → {addressable}`.
- Add a new **demographic filters panel** at the top of Section 2, above the 5 signal-family cards:
  - Reuse the same controls (Age / Income / FICO / Region chips + Tenure / Relationship selects) previously in Step 1.
  - Lift their state (`DemoFilters`, `DEFAULT_FILTERS`, `toggleArr`, `tenureFactor`, `depthFactor`, `groupRatios`, `emptyGroup`, `retention`) into this component.
  - Render as a compact collapsible card (default open) using the same chip/select styling.
- Keep the existing 5 signal-family cards and expanded-panel behavior unchanged — they continue to act as toggleable signal-family filters.
- Update the final-addressable footer to combine **both** filter sources:
  - `finalCount = round(funnel.finalCount * retention)` (signal funnel × demographic retention).
  - If `emptyGroup` is set, show `0` with the existing "re-enable at least one option in {group}" warning.
  - Footer label updates to "Final addressable audience after all filters".
- Keep the staggered reveal animation for the 5 cards; the demographic panel renders immediately when a product is picked.

## Out of scope

- No changes to `MessagePreviewsSection`, `productAutomatedFlows.ts`, `productCatalogExtras.ts`, or the popover content built in the previous turn.
- No changes to filter semantics beyond moving them; the retention math stays identical.

## Files

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — strip filters + reach panel.
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — add demographic filters panel, combine with funnel for final count.
