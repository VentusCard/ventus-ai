

# Dynamic Segment Builder Enhancement

## Overview

Transform the Segment Builder into a fully dynamic targeting tool where users can control additional filters (age ranges, regions, income bands) and see the audience preview and export output respond in real-time to these selections.

## Current Limitations

| Component | Current State | Issue |
|-----------|---------------|-------|
| SegmentBuilder | No demographic filters | Can't refine by age/region |
| LifeEventTargeting | Confidence slider only | Missing timing window selector |
| LifestyleTargeting | Threshold dropdown only | Missing minimum spend input |
| ProductTargeting | Has/lacks checkboxes only | No spending pattern filter |
| AudiencePreview | Hardcoded mock breakdowns | Doesn't respond to filter selections |
| Export Output | Uses segment criteria for age weighting | Doesn't use explicit demographic filters |

## Proposed Changes

### 1. Add Global Demographic Filters to Segment Builder

Add a collapsible "Refine Audience" section below the targeting tabs with:

| Filter | Type | Options |
|--------|------|---------|
| Age Ranges | Multi-select checkboxes | 18-24, 25-34, 35-44, 45-54, 55-64, 65+ |
| Regions | Multi-select checkboxes | Northeast, Southeast, Midwest, Southwest, West, Northwest |
| Income Band | Slider or dropdown | Under $50K, $50-100K, $100-150K, $150K+ |
| Account Tenure | Dropdown | New (< 1yr), Established (1-5yr), Loyal (5yr+) |

### 2. Enhance Each Targeting Mode

**Life Event Tab:**
- Add timing window selector: "0-3 months", "3-6 months", "6-12 months", "12-24 months"
- Show detected signal count per event type

**Lifestyle Tab:**
- Add minimum monthly spend input (optional numeric field)
- Add recency filter: "Active in last 30/60/90 days"

**Product Tab:**
- Add spending pattern filter per product: "Low", "Medium", "High" usage
- Add account age filter for product holdings

### 3. Dynamic Audience Preview

Update AudiencePreview to:
- Use selected demographic filters to calculate breakdowns
- Show only selected age ranges/regions (not all)
- Dynamically adjust estimated size based on filters
- Display filter summary badges

### 4. Dynamic Export Output

Update segmentExportUtils to:
- Respect demographic filter selections when generating contacts
- Only include contacts matching selected age ranges
- Only include contacts in selected regions
- Add income_band and account_tenure fields to export

## Type Updates

Update `src/types/segment.ts`:

```typescript
export interface DemographicFilters {
  ageRanges: string[];
  regions: string[];
  incomeBands?: string[];
  accountTenure?: 'new' | 'established' | 'loyal' | 'all';
}

export interface LifeEventCriteria {
  eventTypes: string[];
  minConfidence: number;
  timingWindow?: '0-3_months' | '3-6_months' | '6-12_months' | '12-24_months';
}

export interface LifestyleCriteria {
  pillars: string[];
  spendingThreshold: 'top_10' | 'top_20' | 'top_30' | 'above_average';
  minMonthlySpend?: number;
  recency?: '30_days' | '60_days' | '90_days';
}

export interface ProductCriteria {
  hasProducts: string[];
  lacksProducts: string[];
  spendingPatterns?: Record<string, 'low' | 'medium' | 'high'>;
  minProductAge?: number; // months
}
```

## UI Design

### Segment Builder Layout

```text
┌──────────────────────────────────────────────────────────────────┐
│ Segment Builder                              [2.4M estimated]    │
├──────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────────┬──────────────────┐             │
│ │ Life Events │ Lifestyle Pillars│ Product Holdings │            │
│ └─────────────┴─────────────────┴──────────────────┘             │
│                                                                  │
│ [Current targeting tab content]                                  │
│                                                                  │
│ ─────────────────────────────────────────────────────────────── │
│ ▼ Refine Audience (optional)                                    │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Age Ranges          Regions              Income             │  │
│ │ ☑ 25-34 ☑ 35-44    ☑ Northeast          [ $50K-$150K  ▼]   │  │
│ │ ☑ 45-54 ☐ 55-64    ☑ West ☐ Midwest                        │  │
│ │                                                             │  │
│ │ Account Tenure: [ Established (1-5yr) ▼]                    │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [Dynamic Audience Preview - responds to all filters]             │
│                                                                  │
│            [Export Segment ▼]    [Save Segment]                 │
└──────────────────────────────────────────────────────────────────┘
```

### Life Event Tab with Timing Window

```text
┌──────────────────────────────────────────────────────────────────┐
│ Select Life Event Types                                          │
│ ┌─────────────────┐ ┌─────────────────┐                         │
│ │ ☑ Retirement    │ │ ☐ Education     │                         │
│ │   4.2% rate     │ │   3.8% rate     │                         │
│ └─────────────────┘ └─────────────────┘                         │
│                                                                  │
│ Timing Window                    Confidence Threshold            │
│ [ Within 6 months    ▼]          [====●=====] 65%               │
│                                                                  │
│ Tip: Narrower timing = smaller but more actionable audience     │
└──────────────────────────────────────────────────────────────────┘
```

### Dynamic Audience Preview

```text
┌──────────────────────────────────────────────────────────────────┐
│ Audience Preview                              [1.8M users]       │
├──────────────────────────────────────────────────────────────────┤
│ Active Filters: [25-34] [35-44] [45-54] [Northeast] [West]      │
│                                                                  │
│ Age Distribution (filtered)      Regional Distribution          │
│ ┌───────────────────────────┐   ┌───────────────────────────┐   │
│ │ 25-34  ████████████ 35%   │   │ Northeast ██████████ 58%  │   │
│ │ 35-44  █████████░░░ 40%   │   │ West      ██████░░░░ 42%  │   │
│ │ 45-54  ██████░░░░░░ 25%   │   │                           │   │
│ └───────────────────────────┘   └───────────────────────────┘   │
│                                                                  │
│ Income Distribution              Account Tenure                  │
│ $50-100K: 45%  $100-150K: 55%   Established (1-5yr): 100%       │
└──────────────────────────────────────────────────────────────────┘
```

## Implementation Files

| File | Changes |
|------|---------|
| `src/types/segment.ts` | Add DemographicFilters interface, expand criteria types |
| `src/components/tepilot/campaigns/SegmentBuilder.tsx` | Add demographicFilters state, add Refine Audience section |
| `src/components/tepilot/campaigns/DemographicFilters.tsx` | New component for age/region/income/tenure filters |
| `src/components/tepilot/campaigns/LifeEventTargeting.tsx` | Add timing window selector |
| `src/components/tepilot/campaigns/LifestyleTargeting.tsx` | Add min monthly spend input, recency filter |
| `src/components/tepilot/campaigns/ProductTargeting.tsx` | Add spending pattern selectors per product |
| `src/components/tepilot/campaigns/AudiencePreview.tsx` | Accept demographicFilters, show dynamic breakdowns |
| `src/lib/segmentData.ts` | Update estimateAudienceSize to factor in demographic filters |
| `src/lib/segmentExportUtils.ts` | Filter generated contacts by demographic selections |

## Audience Size Calculation

The `estimateAudienceSize` function will apply multipliers for demographic filters:

```typescript
// Age range multiplier (each age band = ~17% of population)
const AGE_RANGE_RATES = {
  '18-24': 0.12, '25-34': 0.18, '35-44': 0.17,
  '45-54': 0.17, '55-64': 0.16, '65+': 0.20
};

// Regional multipliers
const REGION_RATES = {
  'Northeast': 0.17, 'Southeast': 0.24, 'Midwest': 0.21,
  'Southwest': 0.12, 'West': 0.18, 'Northwest': 0.08
};

// If user selects 2 age ranges, multiply base by sum of their rates
// If user selects 2 regions, multiply by sum of their rates
```

## Export Output Changes

Exported contacts will:
1. Only include contacts matching selected age ranges
2. Only include contacts from selected regions
3. Include new fields: `income_band`, `account_tenure`
4. Include timing/recency metadata in JSON exports

## Benefits

- Full control over audience composition
- Real-time feedback on how filters affect reach
- Exports match exactly what was configured
- More precise targeting for external marketing campaigns
- Consistent data flow from builder to preview to export

