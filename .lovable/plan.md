

## Plan: Spread Datasets 1–3 Across 12 Months

### Problem
Datasets 1–3 (Sarah Mitchell, James Rodriguez, Emily Chen) currently compress all transactions into a ~2-month window (Aug–Oct 2025). This makes the seasonal heatmap in the Next-Purchase tab nearly useless — all spend clusters in one or two months. Datasets 4–6 already span 12 months and need no changes.

### Approach
Rewrite the three CSV constants (`SAMPLE_CSV`, `SAMPLE_CSV_SPORTS_WELLNESS`, `SAMPLE_CSV_FOOD_HOME`) to spread transactions from **November 2024 through October 2025** (same 12-month window as datasets 4–6). The transaction content, merchants, amounts, and life-event signals stay the same — only dates change.

### Date Distribution Strategy
For each dataset (~75 transactions), distribute them across 12 months with realistic patterns:
- **Recurring transactions** (groceries, gym, subscriptions, gas) appear monthly throughout the year
- **Travel clusters** stay grouped in realistic trip windows (e.g., a NYC trip in Sep, but also add a winter trip)
- **Life-event signals** (SAT prep, campus visits, nursery purchases, mortgage fees) remain interspersed per the existing sample-data strategy
- **Seasonal variety**: holiday shopping in Dec, back-to-school in Aug, wellness surges in Jan

### Changes

**`src/lib/sampleData.ts`** — single file, three CSV constants rewritten:

1. **`SAMPLE_CSV` (Sarah Mitchell)**: ~76 transactions redistributed Nov 2024 – Oct 2025. Monthly grocery/coffee/gas cadence. NYC trip stays in Sep. Concert/entertainment spread across spring/summer. Pet expenses quarterly. Life-event signals (SAT, campus tour) kept in their current relative positions.

2. **`SAMPLE_CSV_SPORTS_WELLNESS` (James Rodriguez)**: ~78 transactions redistributed Nov 2024 – Oct 2025. Monthly gym memberships and supplement purchases. Fitness gear purchases seasonal (Jan resolution, spring refresh). Dallas trip stays in Sep. Life-event signals (prenatal, nursery) kept interspersed.

3. **`SAMPLE_CSV_FOOD_HOME` (Emily Chen)**: ~78 transactions redistributed Nov 2024 – Oct 2025. Weekly grocery pattern throughout. Home improvement projects spread across spring/summer. Restaurant visits monthly. Life-event signals (mortgage, home inspection, title company) kept interspersed.

### Result
All 6 datasets will produce meaningful 12-month seasonal heatmaps in the Next-Purchase intelligence tab, showing real spending peaks, velocity trends, and concentration patterns.

