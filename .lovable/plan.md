

## Add FVI Sensitivity Matrix Overview

### What
A heat-map style matrix component added as a new sub-tab ("Risk Matrix") in the FVI Dashboard, giving bank leaders an at-a-glance view of vulnerability signal intensity across sensitivity tiers and key dimensions.

### Matrix Design

**Y-axis — Sensitivity Tiers (rows):**
- **Tier 1 — High Sensitivity**: Gambling, Adult Content/Services, Illicit Substance-Adjacent
- **Tier 2 — Moderate Sensitivity**: Alcohol, Tobacco/Vape, Firearms & Ammunition, Payday Loans / BNPL Stacking
- **Tier 3 — Contextual**: Cash Advances, Crypto On-Ramps, Pawn Shops, Late-Night Velocity Spikes

**X-axis — Analytical Dimensions (columns):**
- **Flagged Customers** — count of customers with active signals in this category
- **Avg Monthly Spend** — average $ spend per flagged customer
- **MoM Velocity** — month-over-month spend acceleration %
- **% of Income** — average category spend as % of estimated income
- **Escalation Rate** — % of flagged customers whose risk level increased in the last 90 days
- **Intervention Coverage** — % of flagged customers with an active intervention in progress

Each cell is color-coded (green → yellow → orange → red) based on severity thresholds. Hovering a cell shows exact values + context tooltip.

### Files

**1. New: `src/components/tepilot/insights/fvi/FVISensitivityMatrix.tsx`**
- Renders the tier-grouped matrix as a styled HTML table
- Each cell background uses risk-level color with opacity based on severity
- Tier group headers span full row with tier label + description
- Hover tooltip with exact value + threshold context
- Click a row to filter the cohort overview to that category
- Summary row at bottom for each column (totals/averages)
- Mock data inline or added to `fviData.ts`

**2. Update: `src/lib/fviData.ts`**
- Add `sensitivityMatrixData` — array of 11 category rows with values for each X-axis dimension
- Add threshold configs for cell coloring per dimension

**3. Update: `src/components/tepilot/insights/fvi/FVIDashboard.tsx`**
- Add `'matrix'` to FVIView type
- Add "Risk Matrix" tab in the sub-nav (between Cohort Overview and Configuration)
- Render `FVISensitivityMatrix` when active

### Styling
- Consistent with existing light theme
- Risk colors: Green `#22C55E` → Yellow `#EAB308` → Orange `#F97316` → Red `#EF4444`
- Tier headers: subtle background tint (Tier 1 = faint red, Tier 2 = faint amber, Tier 3 = faint slate)
- Monospace font for numbers in cells

