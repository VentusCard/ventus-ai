

## Rewards Intelligence Tab — Merchant Deals & Strategic Timing

### Overview
Add a new "Rewards Intelligence" tab to `AnalyticsContainer` that helps bank leaders discover **which merchant deals to pursue** and **when to deploy them**, powered by the existing 3-level behavioral labeling. Three sections: Seasonal Spending Heatmap, Category Extension Opportunities, and a Timing Intelligence Calendar.

### New Files

**1. `src/components/tepilot/insights/RewardsAnalyticsDashboard.tsx`**
Main container with three collapsible sections:
- **Seasonal Spending Heatmap** — 12 pillars x 52 weeks grid (Recharts heatmap via ScatterChart or custom cells). Color intensity = spend volume. Click a cell to see merchant deal recommendations for that category + time window. Filterable by persona, age range, region, card product (reuses `BankwideFilters`).
- **Category Extension Opportunities** — Cards showing cross-category deals that MCC codes would never connect (e.g., Skiers → GoPro). Each card shows: behavioral signal, extension product, MCC disconnect callout, addressable users, revenue estimate, optimal deployment window, confidence score. Sortable by revenue / confidence / timing urgency.
- **Timing Intelligence Calendar** — Consumes existing `getSpendingTimingHighlights` data. Renders an interactive month-by-month view with spend intensity bars per category, merchant-level deal deployment windows, and negotiation deadlines. Click a month to expand merchant recommendations.

**2. `src/components/tepilot/insights/SeasonalSpendingHeatmap.tsx`**
- Rows = 12 lifestyle pillars + expandable subcategories
- Columns = 12 months (aggregated from weekly data)
- Cell color intensity from spend volume
- Click cell → popover with top merchants, deal recommendations, and "Deploy Deal" timing
- Uses existing `getSpendingTimingHighlights` data for the weekly breakdown

**3. `src/components/tepilot/insights/CategoryExtensionOpportunities.tsx`**
- Accordion or card grid of ~15 opportunities
- Each card: source behavior → extension product with visual "bridge"
- MCC disconnect callout (why traditional systems miss this)
- Metrics: addressable users, estimated revenue, conversion rate, confidence
- Deployment window with negotiate-by deadline
- Sortable/filterable by pillar, persona, priority

**4. `src/components/tepilot/insights/TimingIntelligenceCalendar.tsx`**
- 12-month horizontal timeline
- Each category gets a colored bar showing peak spending weeks
- Overlaid markers for: negotiation deadlines (amber), deployment windows (green), peak weeks (blue)
- Click a bar → merchant-level detail with deal recommendations from `topMerchants` data
- Summary stats: total addressable revenue in current quarter, deals needing immediate negotiation

**5. `src/lib/categoryExtensionData.ts`**
Mock data for ~15-20 category extension opportunities spanning all pillars:
- Skiers → GoPro, The North Face (MCC: Electronics/Apparel ≠ Sports)
- Marathon runners → Sports massage, compression gear
- New parents → Life insurance, 529 plans, home security
- Home renovators → Smart home tech, landscaping
- Foodies → Cooking classes, kitchen appliances
- Pet owners → Pet insurance, grooming subscriptions
- Frequent flyers → Noise-canceling headphones, travel insurance
- College football fans → Tailgating gear, sports bars
- Each with: source pillar/category, behavioral signal, extension product, merchant, MCC disconnect note, addressable users, revenue, timing, confidence, personas, age ranges, regions

### Modified Files

**6. `src/types/bankwide.ts`**
Add `CategoryExtensionOpportunity` interface with fields: id, sourcePillar, sourceCategory, behavioralSignal, extensionProduct, extensionMerchant, extensionCategory, whyItFits, mccDisconnectNote, addressableUsers, estimatedRevenue, projectedConversionRate, confidenceScore, matchingPersonas, topAgeRanges, topRegions, peakSpendingWeeks, optimalDeploymentWindow, deploymentRationale, priority.

**7. `src/components/tepilot/insights/AnalyticsContainer.tsx`**
- Add "Rewards Intelligence" tab with `Sparkles` icon
- Import and render `RewardsAnalyticsDashboard`
- Update `defaultTab` type union

### Design Notes
- Professional, data-dense layout consistent with existing bank-wide analytics
- All mock data, no backend changes
- Reuses `CollapsibleCard`, `Badge`, Recharts, existing color palette
- Filters shared with `BankwideFilters` component pattern

