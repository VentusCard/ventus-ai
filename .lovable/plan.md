

# Fix Preset Templates to Auto-Select Left Panel Chips

## Problem
When clicking a preset template like "New Parents", only the life event is set. The left panel pillars (e.g., "Family & Kids") and products (e.g., "529 Plan") don't get selected because:
1. The template data in `segmentData.ts` is too sparse -- most templates only define one dimension
2. Product names in the templates ("Cashback Card") don't match the product catalog ("Cashback")

## Changes

### 1. Enrich `SEGMENT_TEMPLATES` in `src/lib/segmentData.ts`
Add relevant pillars, products, and campaign goal mappings to each template:

| Template | Add Pillars | Add Products (has/lacks) | Add Goal |
|---|---|---|---|
| New Parents | Family & Kids | has: Checking, Savings; lacks: 529 Plan, Life Insurance | life_event |
| Pre-Retirees | Financial & Aspirational | has: Checking; lacks: Traditional IRA, Managed Portfolio | life_event |
| Home Buyers | Home & Garden | lacks: Home Mortgage, Home Insurance | life_event |
| Travel Enthusiasts | (already set) | lacks: Travel, Airline | cross_sell |
| Fitness & Wellness | (already set) | -- | brand_awareness |
| Food & Dining | (already set) | -- | brand_awareness |
| Pet Parents | (already set) | -- | seasonal |
| Cashback + Travel Spend | Travel & Exploration | fix names: Cashback (not "Cashback Card"), Travel (not "Travel Card"), Premium Travel (not "Premium Travel Card") | cross_sell |
| Travel no Hotel | Travel & Exploration | fix names: Travel, Hotel | cross_sell |
| Premium Upgrade | Financial & Aspirational | fix names: Cashback, Custom Cashback, Premium Travel | upsell |
| Holiday Travelers | (already set) | lacks: Travel Insurance | seasonal |
| Back-to-School | Family & Kids, Education & Learning | lacks: 529 Plan | seasonal |
| Tax Season | (already set) | lacks: Traditional IRA, Roth IRA | seasonal |

Also fix all product name references to match the catalog exactly (e.g., "Cashback" not "Cashback Card").

### 2. Update `handleApplyTemplate` in `CampaignStudio.tsx`
Add setting `campaignGoal` from a new optional field on the template, and set cross-sell/upsell strategies when the template category is "cross_sell".

### 3. Update `SAVED_SEGMENTS` in `src/lib/segmentData.ts`
Fix product names to match catalog (e.g., "Cashback" not "Cashback Card").

## Files Modified

| File | Change |
|---|---|
| `src/lib/segmentData.ts` | Enrich all 13 templates with pillars, products, demographics; fix product names in templates and saved segments |
| `src/components/tepilot/campaigns/CampaignStudio.tsx` | Update `handleApplyTemplate` to also set `campaignGoal` from template data |

## Technical Details

### Template Data Enrichment
Each `SegmentTemplate.suggestedAudience` will include multiple criteria types simultaneously (not just one). The `handleApplyTemplate` function already handles all three criteria types -- it just needs the data to be there.

For example, "New Parents" becomes:
```
suggestedAudience: {
  targetingMode: 'life_event',
  lifeEventCriteria: { eventTypes: ['family'], minConfidence: 0.7, timingWindow: '6-12_months' },
  lifestyleCriteria: { pillars: ['Family & Kids'], spendingThreshold: 'above_average' },
  productCriteria: { hasProducts: ['Checking', 'Savings'], lacksProducts: ['529 Plan', 'Life Insurance'] },
}
```

### Product Name Alignment
All product references will use the exact names from `PRODUCT_CATALOG` in `campaignStudioData.ts` (e.g., "Cashback" not "Cashback Card", "Travel" not "Travel Card").

