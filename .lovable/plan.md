
## Goal

Move the Creditworthiness UI out of the 4th column and render it as a **full-width horizontal card** sitting **above** the 3 product columns in the Next-Product tab.

## Changes

### `src/components/exec-demo/NextProductRationale.tsx`

1. **Layout change** — In the `productCards` branch, revert the column wrapper back to the original 3-column flex (`flex items-stretch gap-3`, cap at 3). Render a new `<CreditworthinessBanner ... />` immediately **above** the columns row (between `RecommendedProductsPills` and the columns), only when `creditAssessment` or `creditLoading` is truthy.

2. **New `CreditworthinessBanner` component** — Replaces `CreditworthinessColumn`. Same data inputs (`assessment`, `loading`) and same band-color logic, but optimized for a wide horizontal layout:

   - Outer card: full-width `rounded-xl border bg-white`, 3px left border in band color, padding `px-4 py-3`.
   - Horizontal grid laid out in one row (collapses to wrap if narrower):
     - **Left block** (fixed-ish width ~220px): "Creditworthiness" label · band+score pill · `confidence% conf` · one-line summary truncated to 2 lines.
     - **Middle block** (flex-1): 4-up affordability mini stats inline — `Monthly Inflow · Monthly Outflow · Surplus · DTI Proxy` — same `formatSpend` / percentage formatting as the column version, separated by thin vertical dividers (`w-px bg-slate-200`).
     - **Signals block** (flex-shrink-0): chip row with `Income / Volatility / Discretionary` level chips + up to 2 positive chips + up to 2 distress chips (fewer than the column version because horizontal real estate is tighter).
     - **Right block** (~260px): "Suggested Next Step" — `recommended_products[0].product` bold + one-line rationale muted.
   - **Top drivers** (collapsed): instead of stacked drivers, render the top 2 driver labels as small inline chips with direction arrows under the summary (e.g. `↑ Stable payroll · ↓ Discretionary creep`). One-line explanations are dropped to keep the card compact.
   - Footnote `Indicative · no bureau data` as a small muted italic line aligned right.

3. **Loading state** — Same banner shell, but middle/right blocks become 3 pulsing slate bars; left block shows "Creditworthiness" label + a `h-7 w-40 bg-slate-100 animate-pulse rounded-full` placeholder.

4. **Empty state** — If `!creditAssessment && !creditLoading`, render nothing (no banner, no reserved space). Columns remain unaffected.

5. **Cleanup** — Delete `CreditworthinessColumn` (replaced by `CreditworthinessBanner`). Keep the exported `CreditAssessment` interface, `BAND_COLORS`, and `LEVEL_TONE` constants intact since the banner reuses them.

### Out of scope

- `ExecDemoPage.tsx`, `ExecDemoIntelPanel.tsx`, edge function, and assessment fetching all stay as-is.
- No new props, no API changes.

## Verification

1. Load `/demo`, pick a customer, wait for enrichment.
2. Confirm a single wide creditworthiness banner appears above the 3 (Life Event / Shopping Habit / Additional Tools) columns.
3. Columns are back to 3-wide (no 4th column squeeze).
4. Customer switch → banner disappears, then re-renders for the new customer.
5. While loading, banner skeleton appears in the same horizontal position.
