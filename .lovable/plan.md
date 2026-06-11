## Goal
In Step 1 ("Pick a product") of the `/bankdemo` Campaign Builder, add a Filters panel beside the existing product search. When collapsed or expanded, the filter panel occupies ~40% of the row width and the search bar takes the remaining ~60%. Filters capture standard bank demographics so downstream audience sizing can later reflect them.

## Layout

Current Step 1 has a single full-width search input with dropdown results, followed by the selected-product summary card.

New layout for the top row inside `ProductPickerSection`:

```text
┌──────────────────────────────────────────────────────────────────┐
│ [ Search products (60%) ]   [ Filters panel (40%) ]              │
└──────────────────────────────────────────────────────────────────┘
[ Selected product summary card — unchanged, full width ]
```

- Two-column flex/grid: `grid-cols-[3fr_2fr]` (60/40) at `md+`, stacks on small screens.
- The search dropdown continues to anchor to the search column only (z-index above the filter card).
- The Filters panel is a self-contained card matching the existing white / `border-slate-200` aesthetic (no `dark:` classes — light theme rule).

## Filters panel UX

- Header row inside the card: `Filter` icon, label "Filters", count badge of active filters, chevron toggle on the right.
- Collapsed state: card still occupies its 40% column (so the layout is stable), shows only the header + a one-line summary like `Age · Income · Tenure · FICO · Region` muted, plus an active-filter count chip if any.
- Expanded state: same card grows downward (does not push the search column) and reveals filter controls. Use a max-height + internal scroll so it never pushes the selected-product card too far.

## Filter contents (standard bank demographics)

Reuse the existing constants in `src/types/segment.ts` so we stay consistent with the rest of the app:

1. Age Ranges — chip multi-select (`AGE_RANGES`)
2. Income Bands — chip multi-select (`INCOME_BANDS`)
3. Account Tenure — single select (`ACCOUNT_TENURE_OPTIONS`)
4. FICO Score — chip multi-select (`FICO_RANGES`)
5. Region — chip multi-select (`REGIONS`)
6. Relationship depth — single select: `Any`, `Single product`, `Multi-product`, `Primary bank` (new, defined inline; non-persistent demo state)
7. Channel preference — chip multi-select: `Mobile`, `Online`, `Branch`, `Phone` (new, inline)

Chips reuse the existing slate/primary styling from `AudienceFiltersPanel` for visual consistency.

A small "Reset filters" link sits in the card footer when any filter is active.

## State + wiring

- Local component state in `ProductPickerSection.tsx`:
  - `filtersOpen: boolean`
  - `filters: DemographicFilters & { relationshipDepth: string; channels: string[] }` (extend the existing `DemographicFilters` shape locally; no changes to shared types yet).
- Filters do not yet alter the funnel math — they are presentational/demo state for this step. Downstream sections (`ExclusionFunnelSection`, `MessagePreviewsSection`) are not touched in this change.
- An optional `onFiltersChange` callback is exposed but unused by the parent for now, so future wiring is trivial.

## Files to change

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx`
  - Wrap the search input + dropdown in a left column.
  - Add new right column with the Filters card.
  - Implement the collapse/expand state, chip controls, summary line, active-count badge, reset link.
- No other files modified. Shared types and other sections stay as-is.

## Out of scope

- No changes to `ExclusionFunnelSection` math or audience numbers.
- No changes to product search behavior, dropdown z-index logic beyond ensuring the filter card sits below it.
- No new types in `src/types/segment.ts` (kept local to avoid churn; can be lifted later if filters need to flow into the funnel).
