# Add Filter-Driven Audience Panel Beside Selected Product Card

## Goal
After a product is selected in Section 1 of the `/bankdemo` Campaign Builder, the selected-product card currently spans the full row. Reuse the right-hand 40% column (where Filters live) to display the **population / market size** that results from the selected product + active demographic filters.

## Layout

Keep the existing `grid-cols-[3fr_2fr]` two-column grid for the selected state. Same 60/40 split as the search + filters row above it.

```text
Before select:  [ Search ........... ] [ Filters ............ ]
After select:   [ Selected product .. ] [ Filters (collapsed) ]
                                        [ Audience panel ..... ]
```

So once a product is selected:
- **Left (60%)** — existing selected product card (unchanged content).
- **Right (40%)** — Filters card stays at the top (still collapsible), and below it an **Audience panel** showing the size estimate driven by the active filters.

## Audience Panel Contents

Compact card, white bg, slate-200 border, matching the other cards:
- Big number: estimated reach (e.g. `1.2M`), formatted with existing `fmt()`.
- Sub-line: "Eligible customers after filters".
- A breakdown row of 3-4 small stats derived from the active filter selections vs. the product's baseline `estimatedAudience`:
  - Baseline eligible (product's `estimatedAudience`)
  - Filter retention % (how much the active demographic filters keep)
  - Net reach (= baseline × retention)
  - Tiny hint text listing the most restrictive dimension (e.g. "Tightest: Income — 2 of 4 bands").
- If no filters are narrowed (all defaults), show full baseline and copy "All segments included — broaden or narrow with filters above".

## Estimate Logic (mock, deterministic)

In `ProductPickerSection.tsx`, compute a `retention` multiplier from the filter state:

```
retention =
  (filters.ageRanges.length     / AGE_RANGES.length) ×
  (filters.incomeBands.length   / INCOME_BANDS.length) ×
  (filters.ficoRanges.length    / FICO_RANGES.length) ×
  (filters.regions.length       / REGIONS.length) ×
  tenureFactor(filters.accountTenure) ×
  depthFactor(filters.relationshipDepth)
```

- `tenureFactor`: `all`=1, `new`=0.25, `established`=0.45, `loyal`=0.30
- `depthFactor`: `any`=1, `single`=0.4, `multi`=0.45, `primary`=0.25
- Floor at 0 (if any chip group is empty, reach = 0 and the panel shows "No customers match — re-enable at least one option in {group}").

`estimatedReach = Math.round(selected.estimatedAudience × retention)`.

## Files Touched

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`
  - Restructure the post-select layout: keep the `grid-cols-[3fr_2fr]` grid visible after selection; selected product card moves into the left column; right column keeps the Filters card and adds the new `<AudiencePanel>` below it.
  - Add internal `AudiencePanel` component + retention math helpers.
  - No changes to props, types, or other sections.

## Out of Scope
- No changes to Sections 2/3, no changes to `productAutomatedFlows.ts`, no new files, no new dependencies.
- No wiring of these filters into downstream sections — purely a visual readout in Section 1.
