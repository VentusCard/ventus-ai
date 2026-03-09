

## Plan: Add Audience Filters with FICO & Signal Threshold to Automated Flows

### Overview
Make the "Audience Matched" badge clickable to toggle an inline audience filter panel per flow. Include FICO score ranges and a **signal spending threshold** (e.g. "at least $1,000 on hotels in last 2 years") instead of channel/engagement filters. Each template gets unique default values.

### Type Changes (`src/types/segment.ts`)
- Add to `DemographicFilters`:
  - `ficoRanges?: string[]` — chip-select from Excellent (750+), Good (700-749), Fair (650-699), Building (<650)
  - `signalThreshold?: { minAmount: number; lookbackMonths: number }` — minimum spend amount + lookback window
- Add constants: `FICO_RANGES` array and `LOOKBACK_OPTIONS` (6mo, 12mo, 24mo, 36mo)

### New Inline Component: `AudienceFiltersPanel`
Built directly inside `AutomatedFlowsSection.tsx` or as a small new component. Renders:
1. **FICO Score** — multi-select chip row (same style as age ranges)
2. **Age Ranges** — existing chip row
3. **Income Bands** — existing chip row  
4. **Account Tenure** — dropdown
5. **Signal Threshold** — a row with a dollar input ("Min spend $") and a lookback dropdown ("in the last X months"), with a label showing the template's signal context (e.g. "on Hotels & Travel" for travel templates, "on Baby & Kids" for new parents)
6. **Regions** — chip row

### Default Filters Per Template (`AutomatedFlowsSection.tsx`)
Each template gets a `getDefaultAudienceFilters(template)` returning unique values:

| Template | FICO | Ages | Income | Tenure | Signal Threshold |
|----------|------|------|--------|--------|-----------------|
| Travel Enthusiasts | Good, Excellent | 25-54 | 50k+ | all | $1,000 / 24mo on Travel |
| New Parents | Good, Excellent | 25-44 | 50k-150k | established | $500 / 12mo on Baby |
| Pre-Retirees | Excellent | 55-64, 65+ | 100k+ | loyal | $2,000 / 24mo on Financial |
| Home Buyers | Good, Excellent | 25-44 | 100k+ | established | $1,500 / 12mo on Home |
| Foodies | All | 25-44 | 50k+ | all | $800 / 12mo on Dining |
| Pet Parents | All | 25-44 | all | all | $600 / 12mo on Pets |
| Cashback High Travel | Good+ | 25-44 | 50k+ | established | $1,200 / 24mo on Travel |
| Others | sensible defaults with varied thresholds |

### State & Interaction (`AutomatedFlowsSection.tsx`)
- New state: `audienceFilterOpenId` (string | null), `flowAudienceFilters` (Record<string, extended DemographicFilters>)
- "Audience Matched" badge gets same clickable styling as "Tier-Matched Product" (bg-primary/50, interactive hover)
- Clicking toggles the filter panel inline, rendered between flow diagram and tier selector
- Each template also gets a `signalCategory` label (e.g. "Travel & Hotels", "Baby & Kids") shown next to the threshold input

### No new dependencies needed.

