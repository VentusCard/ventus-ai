

# AI-Powered Campaign Studio -- Full Redesign

## Overview
Replace the current tab-based Segment Builder with a unified, multi-dimensional Campaign Studio. Instead of choosing one targeting mode at a time (Life Events OR Lifestyle OR Product), users can select criteria across ALL dimensions simultaneously. An AI assistant generates campaign creative (subject lines, copy, CTAs, imagery descriptions) in real-time based on selected chips.

## What Changes

### Current State
- `SegmentBuilder.tsx` uses exclusive `Tabs` -- only one targeting mode at a time
- Product catalog is limited to 8 credit card types from `CARD_PRODUCTS`
- No AI assistance for campaign creative
- No cross-sell/upsell strategy chips
- No metro-level geo targeting

### New Experience
A two-column layout: left side has collapsible chip-cloud sections for every dimension (all visible, all combinable), right side has a sticky AI-generated campaign brief panel. Users toggle chips freely, click "Generate Campaign Brief", and the AI returns subject lines, copy, CTAs, and imagery direction.

## Layout

```text
+-----------------------------------------------+---------------------------+
|  LEFT COLUMN (60%)                             |  RIGHT COLUMN (40%)       |
|  Scrollable dimension selectors                |  Sticky AI Preview        |
|                                                |                           |
|  [v] Lifestyle Pillars (12 chips)              |  Campaign Name: ____      |
|  [v] Life Events (7 chips + sliders)           |                           |
|  [v] Banking Products                          |  Subject Line: "..."      |
|      Credit Cards (10)                         |  Email Body: "..."        |
|      Deposit Accounts (8)                      |  Push Copy: "..."         |
|      Loans (8)                                 |  SMS: "..."               |
|      Investment Products (7)                   |  In-App Banner: "..."     |
|      Insurance (5)                             |  CTA: "..."               |
|      Digital Services (6)                      |  Imagery: "..."           |
|  [v] Geography (regions + metros)              |                           |
|  [v] Demographics (age, income, tenure)        |  [Regenerate] [Copy All]  |
|  [v] Cross-Sell Strategy (6 chips)             |                           |
|  [v] Upsell Strategy (5 chips)                 |  Audience: 12.4M          |
|  [v] Campaign Goal (single-select)             |  [Save] [Export] [CRM]    |
+-----------------------------------------------+---------------------------+
```

## Complete Banking Product Catalog

**Credit Cards** (10): Cashback, Custom Cashback, Travel, Airline, Hotel, Premium Travel, Student, Secured, Business, Co-Branded Retail

**Deposit Accounts** (8): Checking, Savings, High-Yield Savings, Money Market, CD, Business Checking, Business Savings, Youth/Teen

**Loans** (8): Personal, Auto, Home Mortgage, HELOC, Student Loan Refi, Small Business, Line of Credit, Debt Consolidation

**Investment Products** (7): Brokerage, Traditional IRA, Roth IRA, 529 Plan, Robo-Advisor, Managed Portfolio, Trust Account

**Insurance** (5): Life, Home, Auto, Travel, Identity Theft Protection

**Digital Services** (6): Mobile Banking Active, Digital Wallet, Zelle/P2P Active, Direct Deposit Active, Bill Pay Active, Overdraft Protection

Each product has a "Must Have" / "Must NOT Have" toggle for cross-sell logic.

## Cross-Sell Strategy Chips
- "Has basic, lacks premium" (upgrade path)
- "Has cards, lacks deposit" (deepen relationship)
- "Has deposit, lacks cards" (activation play)
- "Has personal, lacks business" (business banking)
- "Single product holder" (expansion)
- "Dormant account reactivation"

## Upsell Strategy Chips
- "Tier upgrade eligible"
- "Balance growth potential"
- "Fee waiver candidates"
- "Loyalty tier advancement"
- "Annual fee justification"

## Campaign Goal (single-select)
Acquisition, Cross-Sell, Upsell, Retention, Reactivation, Seasonal Promotion, Life Event Response, Brand Awareness

## AI Campaign Brief Generation
When users click "Generate Campaign Brief", an edge function takes all selected dimensions as structured JSON and returns:
- Campaign Name (auto-generated, editable)
- Email Subject Line
- Email Body (2-3 sentence marketing copy)
- Push Notification (short, with emoji)
- SMS (160 chars)
- In-App Banner copy
- CTA Text + suggested CTA link
- Imagery Direction (description for creative team)
- Offer Suggestion (type, value, validity)

Uses streaming via `google/gemini-3-flash-preview` with tool calling to return structured output. Each field is individually editable after generation. "Regenerate" button gets a new variation.

## Files to Create

| File | Purpose |
|---|---|
| `src/types/campaign-studio.ts` | Types for all dimensions, product catalog items, campaign brief, cross-sell/upsell strategies |
| `src/lib/campaignStudioData.ts` | Full product catalog constants (44 products), strategy chips, metro areas, audience estimation logic |
| `src/components/tepilot/campaigns/CampaignStudio.tsx` | Main two-column layout, manages all dimension state, audience estimation, save/export actions |
| `src/components/tepilot/campaigns/DimensionChipCloud.tsx` | Reusable collapsible chip-cloud selector (title, multi-select chips, count badge, optional sliders) |
| `src/components/tepilot/campaigns/ProductDimensionGroup.tsx` | Product chips organized by category with has/lacks toggles per product |
| `src/components/tepilot/campaigns/GeoDimensionSelector.tsx` | Region chips + top 20 metro area chips + Urban/Suburban/Rural toggle |
| `src/components/tepilot/campaigns/StrategyChips.tsx` | Cross-sell and upsell strategy chip selectors |
| `src/components/tepilot/campaigns/CampaignGoalSelector.tsx` | Single-select campaign goal chips |
| `src/components/tepilot/campaigns/AICampaignPreview.tsx` | Right panel: streaming AI brief with editable fields, regenerate, copy all |
| `src/components/tepilot/campaigns/AudienceEstimateBar.tsx` | Live audience counter at bottom of left panel with population and geo/age breakdown |
| `supabase/functions/generate-campaign-brief/index.ts` | Edge function calling Lovable AI to generate structured campaign brief via tool calling |

## Files to Modify

| File | Change |
|---|---|
| `src/components/tepilot/campaigns/SegmentTargetingView.tsx` | Replace `SegmentBuilder` import with `CampaignStudio`, keep `SegmentTemplateGrid` and `SavedSegmentsTable` below |
| `supabase/config.toml` | Add `[functions.generate-campaign-brief]` with `verify_jwt = false` |

## Files to Remove

| File | Reason |
|---|---|
| `src/components/tepilot/campaigns/SegmentBuilder.tsx` | Replaced entirely by `CampaignStudio` |

## Technical Details

### Edge Function: `generate-campaign-brief`
- Uses `google/gemini-3-flash-preview` via Lovable AI gateway
- Streaming SSE response for token-by-token rendering
- Tool calling with `generate_brief` function for structured output containing: `campaign_name`, `subject_line`, `email_body`, `push_copy`, `sms_copy`, `in_app_copy`, `cta_text`, `cta_link`, `imagery_direction`, `offer_type`, `offer_value`, `offer_validity_days`
- Handles 429/402 errors with user-facing toasts
- System prompt includes banking/financial marketing context

### Audience Estimation
Extends `estimateAudienceSize` to handle all new dimensions simultaneously:
- Base: 75M users
- Products: realistic penetration rates per product category
- Life events: existing detection rates
- Lifestyle: existing threshold multipliers
- Geography: region + metro sub-rates
- Strategies: intersection multipliers (cross-sell/upsell narrow the audience)
- Demographics: existing age/income/tenure multipliers
- All dimensions combine multiplicatively (intersection logic)

### Reusable `DimensionChipCloud` Component
Props: `title`, `icon`, `chips[]`, `selectedChips`, `onToggle`, `defaultOpen?`, `badge?`
- Wraps `Collapsible` from existing UI library
- Each chip is a rounded pill with checkbox dot, colored border when selected
- Section header shows count badge when chips are selected
- Consistent design across all dimension sections

### State Management
All dimension state lives in `CampaignStudio.tsx` as individual `useState` hooks:
- `selectedPillars: string[]`
- `lifeEventCriteria: LifeEventCriteria` (reuses existing type)
- `selectedProducts: Record<string, 'has' | 'lacks'>` (product name to mode)
- `selectedRegions: string[]`, `selectedMetros: string[]`, `areaType: string`
- `demographicFilters: DemographicFilters` (reuses existing type)
- `crossSellStrategies: string[]`
- `upsellStrategies: string[]`
- `campaignGoal: string`
- `generatedBrief: CampaignBrief | null`

### Existing Components Preserved
- `LifeEventTargeting`, `LifestyleTargeting`, `ProductTargeting` -- kept as files but no longer used by the new studio (the studio reimplements their chip patterns inline via `DimensionChipCloud`)
- `DemographicFilters` -- reused as-is inside the studio
- `AudiencePreview` -- reused for the audience breakdown display
- `SegmentExportControls` -- reused for the export popover
- `SegmentTemplateGrid` and `SavedSegmentsTable` -- remain below the studio in the view

### CRM Transfer Button
A `DropdownMenu` in the right panel with options:
- Salesforce -- toast "Coming soon"
- HubSpot -- toast "Coming soon"  
- Marketo -- toast "Coming soon"
- Custom API -- toast "Coming soon"

Placeholder for future integration.

