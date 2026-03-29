

## Financial Vulnerability Indicators (FVI) Module

### Overview
Add a comprehensive FVI dashboard under the "Health" sidebar group. Three sub-views: Cohort Overview (landing), Cohort Detail (drill-down), and Settings/Configuration. All mock data, no backend changes.

### New Files

**1. `src/lib/fviData.ts`** — Mock data and flagging logic
- 7 hardcoded cohorts with descriptions, customer counts, trends, FVI scores, categories, recommended actions
- 20-30 mock customer profiles per cohort (randomized names, 6-month spend history, income estimates)
- 20+ obfuscated merchant mappings (Fenix International → OnlyFans, TSG Interactive → PokerStars, etc.)
- Flagging logic functions: `absolute_flag`, `income_pct_flag`, `velocity_flag`, `frequency_flag` → `composite_fvi_score`
- Cohort assignment logic (customers can appear in multiple cohorts)
- Default threshold/weight configuration objects
- Sub-segment breakdown generators (income band, account type, geography, tenure)

**2. `src/components/tepilot/insights/fvi/FVICohortOverview.tsx`** — Landing dashboard
- Top bar: title, date range selector, portfolio filter dropdown
- Summary cards row: total monitored, flagged customers (count + %), cohorts requiring action, trend vs prior quarter
- Cohort cards grid (7 cards): name, description, customer count, trend indicator (↗/→/↘), avg FVI score (color-coded green/yellow/orange/red), top category pills, 2-3 recommended next steps, "View Cohort" button
- Risk level filter pills to filter visible cohorts
- Growing + high-severity cohorts get subtle urgency styling (border glow)
- Recovery Trajectory card uses green accents
- Empty state for 0-customer cohorts (dimmed card)

**3. `src/components/tepilot/insights/fvi/FVICohortDetail.tsx`** — Drill-down view
- Header: cohort name, description, count, trend, large color-coded FVI score
- Section A: Area chart — cohort size over 6 months + overlay of avg category spend (Recharts)
- Section B: Breakdown table/bars by income band, account type, geography, tenure
- Section C: 4 metric cards — avg monthly spend, % of income, MoM velocity, transaction frequency
- Section D: Obfuscated Merchant Intelligence table (raw descriptor → Ventus identification, confidence badge, category) + callout box explaining MCC limitation
- Section E: Expanded recommended actions as cards with owner, priority, toggleable status (In Progress / Completed — local state only)
- Back button to return to overview

**4. `src/components/tepilot/insights/fvi/FVISettings.tsx`** — Configuration panel
- Per-category threshold sliders (Gambling, Payday, Adult, Cash Advances, Alcohol/Tobacco) with Monitor/Alert/Critical breakpoints for spend $, % income, velocity
- Cohort definition rules: checkboxes for Distress Cascade combinations, dollar thresholds for New Pattern, σ selector for Outliers, months for Recovery
- Composite score weight sliders (sum to 100%)
- Action templates: editable text fields per cohort pre-filled with defaults

**5. `src/components/tepilot/insights/fvi/FVIDashboard.tsx`** — Container/router
- Internal state to manage which sub-view is active (overview / detail / settings)
- Passes selected cohort ID to detail view
- Tab bar or header buttons to switch between Overview and Settings

### Modified Files

**6. `src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Add `'fvi-dashboard'` to `TabValue` union
- Add nav item under Health group: `{ value: "fvi-dashboard", label: "Financial Vulnerability", icon: ShieldAlert }` (from lucide)
- Import `FVIDashboard` and add case in `renderContent()` switch
- Import `ShieldAlert` from lucide-react

### Styling
- Follows existing light theme (white bg, slate borders) consistent with other tabs — NOT the dark mode described in the prompt
- Risk color system: Green `#22C55E` → Yellow `#EAB308` → Orange `#F97316` → Red `#EF4444`
- Ventus blue `#3B82F6` for accents
- Uses existing Card, Badge, Button, Table, Slider, Checkbox, Select components
- Recharts for charts (already in project)

### Interactions
- Cohort cards clickable → detail view
- All tables sortable by column
- Filter pills on overview
- Threshold sliders recalculate scores in real-time (local state)
- Chart hover tooltips
- Action item toggle for demo interactivity

