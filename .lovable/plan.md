
# Campaign Planner for Analytics Console

## Overview

Add a **Campaign Planner** view alongside the existing **Analytics Dashboard** within the Analytics persona card. This tool enables targeting teams to identify customer segments based on behavioral signals and create customized marketing campaigns with personalized messaging.

## Core Use Cases

The Campaign Planner addresses three targeting approaches:

### 1. Life Event-Based Targeting
Target customers showing early behavioral signals for major life events:
- **Retirement Planning**: Pre-retirees with increased travel, philanthropy signals
- **Education Funding**: Parents researching colleges, 529 planning signals
- **Family Formation**: New baby indicators, daycare/pediatric spending
- **Home Purchase**: Real estate research, moving preparation signals
- **Elder Care**: Medical alert systems, home health signals
- **Business Liquidity**: Exit planning, advisor consultation patterns
- **Wealth Transfer**: Estate planning, charitable giving increases

### 2. Lifestyle Indicator-Based Targeting
Leverage the 12-pillar spending analysis for behavioral cohorts:
- **Travel Enthusiasts**: High Travel & Exploration pillar spend
- **Fitness Devotees**: Health & Wellness + Sports spending patterns
- **Foodies**: Food & Dining concentration above threshold
- **Home Improvers**: Home & Living spending spikes
- **Tech Early Adopters**: Technology & Digital Life patterns
- **Pet Parents**: Pets pillar spending signals
- **Entertainment Seekers**: Entertainment & Culture concentration

### 3. Product-Based Targeting
Cross-sell and upgrade campaigns based on product holdings:
- **Card Upgrade Candidates**: Cashback holders with Travel-heavy spending
- **Multi-Product Opportunities**: Single-product holders with cross-sell potential
- **Premium Tier Candidates**: High-spend customers on basic products

---

## Architecture

```text
TePilot.tsx (bankwide section)
└── When insightType === 'bankwide'
    └── AnalyticsContainer.tsx (new wrapper)
        ├── Tab: "Analytics Dashboard"
        │   └── BankwideView.tsx (existing)
        └── Tab: "Campaign Planner"
            └── CampaignPlannerView.tsx
                ├── CampaignMetricsSummary.tsx
                ├── SegmentBuilder.tsx (3-mode targeting)
                ├── CampaignTemplateGrid.tsx
                ├── ActiveCampaignsTable.tsx
                └── CampaignDetailDialog.tsx
```

---

## Key Components

### 1. Segment Builder (Core Feature)

Three-tab interface for building target audiences:

**Life Events Tab:**
- Select from 7 life event types with confidence thresholds
- Show estimated audience size based on mock detection rates
- Display sample behavioral evidence patterns

**Lifestyle Pillars Tab:**
- Multi-select from 12 lifestyle pillars
- Set spending threshold (e.g., "Top 20% in Travel")
- Combine pillars for cohort definition (e.g., "Travel + Dining enthusiasts")

**Product Holdings Tab:**
- Filter by current card products
- Cross-sell rules (e.g., "Has Cashback, No Travel Card")
- Spending behavior filters

**Combined Audience Preview:**
- Real-time estimated reach based on selections
- Demographic breakdown of selected segment
- Regional distribution visualization

### 2. Campaign Templates

Pre-built templates derived from existing Revenue Opportunities:

| Template Category | Examples |
|-------------------|----------|
| Life Event | "New Parent 529 Plan", "Pre-Retiree Travel Card Upgrade" |
| Lifestyle Cohort | "Fitness Enthusiasts Wellness Rewards", "Foodies DashPass Offer" |
| Cross-Sell | "Cashback to Travel Card Conversion", "Hotel Card Add-on" |
| Seasonal | "Back-to-School", "Holiday Travel", "Tax Season" |

Each template includes:
- Pre-configured audience criteria
- Suggested messaging framework
- Recommended timing window
- Estimated conversion rate and revenue impact

### 3. Message Customization

For each campaign, configure personalized messaging:

**Message Variables:**
- `{first_name}` - Customer name
- `{top_pillar}` - Their highest spending category
- `{life_event}` - Detected life event name
- `{current_product}` - Current card product
- `{savings_estimate}` - Calculated annual savings

**Channel Templates:**
- Email subject line + body
- Push notification text
- In-app banner copy
- SMS message

**Preview Panel:**
- Shows message rendered with sample customer data
- A/B variant creation support

### 4. Campaign Performance Dashboard

Track active and completed campaigns:

| Metric | Description |
|--------|-------------|
| Reach | Total customers targeted |
| Impressions | Messages delivered |
| Activation Rate | % who took action |
| Revenue Generated | Attributed spend increase |
| ROI | Return on campaign investment |

---

## Data Types

New type definitions in `src/types/campaign.ts`:

```typescript
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type TargetingMode = 'life_event' | 'lifestyle' | 'product';
export type CampaignChannel = 'email' | 'push' | 'in_app' | 'sms' | 'direct_mail';

export interface LifeEventCriteria {
  eventTypes: string[];
  minConfidence: number;
  timingWindow?: string;
}

export interface LifestyleCriteria {
  pillars: string[];
  spendingThreshold: 'top_10' | 'top_20' | 'top_30' | 'above_average';
  minMonthlySpend?: number;
}

export interface ProductCriteria {
  hasProducts: string[];
  lacksProducts: string[];
  spendingPatterns?: Record<string, string>;
}

export interface AudienceSegment {
  id: string;
  name: string;
  targetingMode: TargetingMode;
  lifeEventCriteria?: LifeEventCriteria;
  lifestyleCriteria?: LifestyleCriteria;
  productCriteria?: ProductCriteria;
  demographicFilters?: {
    ageRanges: string[];
    regions: string[];
  };
  estimatedSize: number;
}

export interface CampaignMessage {
  channel: CampaignChannel;
  subject?: string;
  body: string;
  ctaText: string;
  ctaLink: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  audience: AudienceSegment;
  messages: CampaignMessage[];
  offer: {
    type: 'cashback' | 'points_multiplier' | 'product_discount' | 'product_upgrade';
    value: string;
    merchantPartner?: string;
    validityDays: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
    deploymentWindow?: string;
  };
  budget: number;
  createdAt: string;
  metrics?: CampaignMetrics;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'life_event' | 'lifestyle' | 'cross_sell' | 'seasonal';
  iconHint: string;
  suggestedAudience: Partial<AudienceSegment>;
  suggestedOffer: Campaign['offer'];
  suggestedMessages: Partial<CampaignMessage>[];
  estimatedImpact: number;
  conversionRate: number;
  priority: 'high' | 'medium' | 'low';
  seasonalWindow?: string;
}
```

---

## Implementation Phases

### Phase 1: Container and Navigation
- Create `AnalyticsContainer.tsx` with tabs
- Update `TePilot.tsx` to use container
- Basic campaign planner view skeleton

### Phase 2: Segment Builder
- Three-tab targeting interface
- Life event selection with confidence sliders
- Lifestyle pillar multi-select with thresholds
- Product criteria builder
- Real-time audience size estimation

### Phase 3: Campaign Templates
- Template grid using Revenue Opportunities data
- One-click campaign creation from templates
- Category filtering (life event, lifestyle, cross-sell, seasonal)

### Phase 4: Campaign Creation Flow
- Campaign detail dialog/form
- Message customization with variables
- Channel selection
- Schedule and budget configuration

### Phase 5: Campaign Management
- Active campaigns table with status badges
- Performance metrics display
- Campaign pause/resume/duplicate actions

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/tepilot/insights/AnalyticsContainer.tsx` | Tab wrapper for Dashboard + Planner |
| `src/components/tepilot/campaigns/CampaignPlannerView.tsx` | Main campaign planner container |
| `src/components/tepilot/campaigns/SegmentBuilder.tsx` | 3-mode audience targeting builder |
| `src/components/tepilot/campaigns/LifeEventTargeting.tsx` | Life event selection panel |
| `src/components/tepilot/campaigns/LifestyleTargeting.tsx` | Pillar-based cohort builder |
| `src/components/tepilot/campaigns/ProductTargeting.tsx` | Product holdings criteria |
| `src/components/tepilot/campaigns/AudiencePreview.tsx` | Segment size and breakdown |
| `src/components/tepilot/campaigns/CampaignTemplateGrid.tsx` | Pre-built template cards |
| `src/components/tepilot/campaigns/CampaignTemplateCard.tsx` | Individual template card |
| `src/components/tepilot/campaigns/ActiveCampaignsTable.tsx` | Campaign list with status |
| `src/components/tepilot/campaigns/CampaignDetailDialog.tsx` | Create/edit campaign form |
| `src/components/tepilot/campaigns/MessageEditor.tsx` | Message customization panel |
| `src/components/tepilot/campaigns/CampaignMetricsSummary.tsx` | Top-level metrics cards |
| `src/types/campaign.ts` | TypeScript definitions |
| `src/lib/campaignData.ts` | Mock data and audience estimation |
| `src/lib/campaignTemplates.ts` | Pre-built templates from revenue opps |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/TePilot.tsx` | Replace `<BankwideView />` with `<AnalyticsContainer />` |

---

## Mock Data Strategy

The campaign planner will leverage existing data sources:

1. **Audience Estimation**: Use `getBankwideMetrics()` and filter functions
2. **Campaign Templates**: Derive from `getRevenueOpportunities()` data
3. **Life Event Stats**: Use `LIFE_EVENT_CONFIG` and mock detection rates
4. **Pillar Data**: Use `LIFESTYLE_PILLARS` and `getPillarDistribution()`

Sample audience estimation logic:
```typescript
function estimateAudienceSize(criteria: AudienceSegment): number {
  const baseUsers = 75_000_000; // Total users
  let multiplier = 1.0;
  
  // Life event detection rate (~2-8% per event type)
  if (criteria.lifeEventCriteria) {
    multiplier *= 0.05 * criteria.lifeEventCriteria.eventTypes.length;
  }
  
  // Lifestyle threshold (top 10% = 0.10, top 20% = 0.20)
  if (criteria.lifestyleCriteria) {
    const thresholdMap = { top_10: 0.10, top_20: 0.20, top_30: 0.30, above_average: 0.50 };
    multiplier *= thresholdMap[criteria.lifestyleCriteria.spendingThreshold];
  }
  
  // Product filtering
  if (criteria.productCriteria?.hasProducts.length) {
    const productPenetration = criteria.productCriteria.hasProducts.reduce((sum, p) => {
      const product = CARD_PRODUCTS.find(cp => cp.name === p);
      return sum + (product?.penetrationRate || 0) / 100;
    }, 0);
    multiplier *= productPenetration / criteria.productCriteria.hasProducts.length;
  }
  
  return Math.floor(baseUsers * multiplier);
}
```

---

## UI Design Notes

- Use existing shadcn/ui components (Tabs, Card, Badge, Dialog, Table)
- Follow current slate/primary color scheme
- Campaign template cards similar to PersonaCard styling
- Segment builder uses pill/chip selection pattern from BankwideFilters
- Metrics cards follow BankwideMetrics styling
