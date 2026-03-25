

## Redesign "Category Consolidation & Budgeting" Tab — Pillar-Centric Intelligence

### Goal
Transform this tab from a generic bank-wide dashboard into a **pillar-driven insights hub** for bank leaders, showing how the 12 lifestyle pillars vary across regions, age groups, and seasonal timing.

### Current State
The tab has: intro banner → filters → 6 metric cards → card product matrix → pillar grid → demographics → revenue opportunities → cross-sell matrix. The pillar grid exists but is one section among many generic analytics. Card Product Matrix and Demographics are separate, disconnected from pillars.

### New Layout

```text
┌─────────────────────────────────────────────────────────┐
│  Intro Banner (updated: pillar-focused messaging)       │
├─────────────────────────────────────────────────────────┤
│  Filters (existing — keep as-is)                        │
├─────────────────────────────────────────────────────────┤
│  Headline Metrics (keep existing 6 cards)               │
├─────────────────────────────────────────────────────────┤
│  12-Pillar Explorer (existing — keep, it's the core)    │
├──────────────────────────┬──────────────────────────────┤
│  NEW: Pillar × Region   │  NEW: Pillar × Age Group     │
│  Heatmap                │  Heatmap                     │
│  Rows=pillars, Cols=5   │  Rows=pillars, Cols=5 age    │
│  regions, color=spend   │  ranges, color=spend index   │
├──────────────────────────┴──────────────────────────────┤
│  NEW: Pillar Seasonal Timing Grid                       │
│  12 compact cards, each with monthly mini-bar sparkline │
│  + peak quarter label + deployment window annotation    │
├─────────────────────────────────────────────────────────┤
│  Revenue Opportunities (keep existing)                  │
├─────────────────────────────────────────────────────────┤
│  Cross-Sell Matrix (keep existing)                      │
└─────────────────────────────────────────────────────────┘
```

**Removed sections**: Card Product Matrix and Demographic Breakdown (their data is now integrated into the pillar heatmaps).

### New Components

**1. `PillarRegionHeatmap.tsx`**
- Grid: 12 pillar rows × 5 region columns (Northeast, Southeast, Midwest, West, Southwest)
- Cell shows spend volume with color intensity (white → pillar color)
- Hover tooltip: exact spend, user count, % of region total
- Row header = pillar name with color dot; column header = region name

**2. `PillarAgeHeatmap.tsx`**
- Grid: 12 pillar rows × 5 age columns (18-24, 25-34, 35-44, 45-54, 55+)
- Cell shows spend index (100 = average; >100 = over-indexes for that age group)
- Color scale: blue (low) → green (average) → orange/red (high)
- Helps leaders see which pillars skew young vs. old

**3. `PillarTimingGrid.tsx`**
- 3×4 grid of compact cards, one per pillar
- Each card: pillar name + color accent, 12 mini-bars (Jan–Dec) showing monthly spend distribution
- Peak quarter badge (e.g., "Q4 Peak")
- One-line deployment insight (e.g., "Activate deals in Sept for holiday ramp")

### Data Functions in `mockBankwideData.ts`

**`getPillarRegionMatrix(filters)`** — returns `{ pillar, region, spend, userCount, percentOfRegion }[]`
- Derive from existing state spending data which already has per-state pillar breakdowns and region assignments

**`getPillarAgeMatrix(filters)`** — returns `{ pillar, ageGroup, spendIndex, spend }[]`
- Use existing age breakdown percentages from `getPillarDetails`, vary by pillar to show realistic skews (e.g., Technology skews 25-34, Pets skews 35-44)

**`getPillarTimingData()`** — returns `{ pillar, monthly: number[12], peakQuarter, deploymentTip }[]`
- Mock seasonal patterns (Travel peaks summer, Entertainment peaks Q4, etc.)

### Files to Create
- `src/components/tepilot/insights/PillarRegionHeatmap.tsx`
- `src/components/tepilot/insights/PillarAgeHeatmap.tsx`
- `src/components/tepilot/insights/PillarTimingGrid.tsx`

### Files to Modify
- `src/lib/mockBankwideData.ts` — add 3 data functions
- `src/components/tepilot/insights/BankwideView.tsx` — replace Card Product Matrix and Demographics with the 3 new pillar-centric sections, update intro banner copy

