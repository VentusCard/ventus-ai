# Anticipated LTV Lift sliver above Key Features

## Goal
In the three personalization tabs on `/bankdemo` (Personalized Deals, Personalized Product, Personalized Relationship), add a compact "Anticipated LTV Lift" card at the top of the third column, above Key Features. It takes about 25% of the column height when collapsed (default) and expands on click, pushing Key Features down.

## What you'll see
- Third column becomes a vertical stack:
  1. **Anticipated LTV Lift** sliver (collapsed by default, ~25% of the column height)
  2. **Key Features** card filling the rest
- Collapsed sliver shows one row: a trending-up icon, "Anticipated LTV Lift" title, the headline lift value for the current tab (e.g. "+$48 / customer / yr"), a short driver hint (e.g. "driven by 12 live offers"), and a chevron.
- Clicking expands it to show 2–3 supporting lines per surface (the assumptions behind the lift) with a smooth height transition; Key Features shrinks to make room. Clicking again collapses it.
- When no customer is selected, the sliver shows the baseline estimate in a muted state, matching the existing disabled look of Key Features.
- Strict light theme: white card, slate-200 border, no dark-mode classes.

## Per-surface content (reusing the former unit-economics assumptions)
- **Deals**: incremental deal spend routed to bank rails × take rate → "+$48 / customer / yr"; driver = live offer count.
- **Product**: conversion on recommended products × acquisition cost avoided → "+$17 / customer / yr"; driver = recommended product count.
- **Relationship**: attrition reduction × replacement cost avoided → "+$12 / customer / yr"; driver = detected signal count.
- Values compute from the selected customer's live generated data (offers / product cards / signals) where available, with sensible defaults before generation completes.

## Technical details
- New component `src/components/tepilot/insights/personalization/LtvLiftSliver.tsx`:
  - Props: `surface`, `customerKey`, plus computed lift value + driver lines passed in or derived via a small helper.
  - `useState` for expanded (default false); outer container uses flex sizing so collapsed ≈ 25% of column height (`flex-[0_0_25%]` / max-height) and expanded grows naturally with a `transition-[height]` or grid-rows animation.
- New helper `src/lib/personalizationLtvLift.ts`: per-surface lift calculation and copy, adapted from the removed `personalizationUnitEconomics.ts` (recoverable from git history), simplified to a single lift value + 2–3 explanation lines per surface.
- `src/components/tepilot/insights/personalization/SurfaceFeaturePanel.tsx`: render `LtvLiftSliver` above the Key Features card; the panel becomes a `flex flex-col` column where the sliver sits on top and Key Features keeps `flex-1`.
- `CustomerMockupPanel.tsx`: no structural change expected (it already renders `SurfaceFeaturePanel`), but it passes the example customer / generation status if needed for live values.

## Acceptance criteria
- All three personalization tabs show the LTV Lift sliver above Key Features.
- Collapsed by default at ~25% of column height; expands on click and pushes Key Features down.
- Values update when a different customer is selected.
- Typecheck and build pass; no console errors on `/bankdemo`.
