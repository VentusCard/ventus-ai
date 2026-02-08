
# Refocus Campaign Planner to Targeting-Centric Flow

## Overview

Adjust the Campaign Planner to focus on its core purpose: helping targeting teams build behavioral segments and export them for use with external marketing providers (Mailchimp, SendGrid, Twilio, etc.). The current implementation includes campaign management features (templates, active campaigns table, campaign creation dialog) that are outside the scope of segment targeting.

## Current State Issues

The current implementation mixes two concerns:
1. **Segment Building & Export** (the core goal) - building audiences based on life events, lifestyle, and product holdings, then exporting to external providers
2. **Campaign Management** (out of scope) - internal campaign creation, messaging, scheduling, budget, and tracking active campaigns

The campaign templates, active campaigns table, and campaign detail dialog assume an internal campaign management system that doesn't align with the goal of exporting segments to external providers.

## Proposed Changes

### 1. Rename Section to "Segment Targeting"
- Change "Campaign Planner" to "Segment Targeting" to better reflect its purpose
- Update intro text to focus on building segments for external marketing providers

### 2. Replace Campaign Metrics with Segment Metrics
- Instead of "Active Campaigns, Total Reach, Revenue Generated, Activation Rate"
- Show "Saved Segments, Total Contacts Available, Recent Exports, Provider Integrations"

### 3. Refocus Templates as "Segment Templates"
- Rebrand from "Campaign Templates" to "Segment Templates"
- Remove campaign-specific details (messaging, offers, scheduling)
- Focus on audience targeting criteria and estimated size
- Template action becomes "Use This Targeting" which populates the Segment Builder

### 4. Replace Active Campaigns Table with Saved Segments Table
- Instead of tracking campaigns, track saved segment definitions
- Show: Segment Name, Targeting Mode, Criteria Summary, Est. Size, Last Exported, Export Actions
- Allow quick re-export of previously built segments

### 5. Simplify Template Card to Segment Focus
- Remove revenue impact and conversion rate metrics (those are campaign metrics)
- Show estimated audience size and targeting criteria
- "Use Template" becomes primary action to populate builder

### 6. Remove Campaign Detail Dialog
- Remove the dialog that creates internal campaigns
- The "Create Campaign" button in SegmentBuilder becomes "Save Segment"
- Primary action remains export via SegmentExportControls

### 7. Update Segment Builder Actions
- Rename "Create Campaign with This Segment" to "Save Segment"
- Keep export controls as the primary action for external provider integration

## File Changes

### Files to Modify

| File | Changes |
|------|---------|
| `CampaignPlannerView.tsx` | Rename to SegmentTargetingView, remove CampaignDetailDialog, update intro text |
| `CampaignMetricsSummary.tsx` | Change to SegmentMetricsSummary with segment-focused metrics |
| `CampaignTemplateGrid.tsx` | Rename to SegmentTemplateGrid, simplify to targeting focus |
| `CampaignTemplateCard.tsx` | Rename to SegmentTemplateCard, remove campaign metrics |
| `ActiveCampaignsTable.tsx` | Rename to SavedSegmentsTable, show saved segment definitions |
| `SegmentBuilder.tsx` | Change "Create Campaign" button to "Save Segment" |
| `AnalyticsContainer.tsx` | Update tab label from "Campaign Planner" to "Segment Targeting" |
| `campaignData.ts` | Update templates to be segment-focused, add saved segments mock data |

### Detailed Component Changes

**CampaignPlannerView.tsx -> Restructured as Segment Targeting View**
- Remove `CampaignDetailDialog` import and usage
- Update intro text: "Build targeted audience segments based on behavioral signals... Export to your preferred marketing platform"
- Change `handleCreateFromSegment` to `handleSaveSegment` (show toast confirmation)
- Keep segment builder and templates grid

**CampaignMetricsSummary.tsx -> SegmentMetricsSummary**
- Change cards to:
  - "Saved Segments" (count of saved segment definitions)
  - "Total Contacts" (sum of all segment sizes)
  - "Recent Exports" (exports in last 30 days)
  - "Targeting Modes" (life event / lifestyle / product breakdown)

**CampaignTemplateGrid.tsx -> SegmentTemplateGrid**
- Keep category filtering (life_event, lifestyle, cross_sell, seasonal)
- Change title from "Campaign Templates" to "Segment Templates"
- Description: "Start from pre-built targeting strategies to quickly build segments"

**CampaignTemplateCard.tsx -> SegmentTemplateCard**
- Remove revenue impact and conversion rate
- Show estimated audience size prominently
- Show targeting criteria summary
- Button: "Use This Targeting" (populates Segment Builder)

**ActiveCampaignsTable.tsx -> SavedSegmentsTable**
- Columns: Segment Name, Mode, Criteria, Est. Size, Created, Last Export
- Actions: Export (dropdown with format options), Edit (loads into builder), Delete
- Remove campaign status, activation rate, revenue, budget

**SegmentBuilder.tsx**
- Change button from "Create Campaign with This Segment" to "Save Segment"
- When clicked, show toast "Segment saved" and add to saved segments list
- Export controls remain as primary integration point

## Updated Architecture

```text
AnalyticsContainer.tsx
├── Tab: "Analytics Dashboard" → BankwideView.tsx
└── Tab: "Segment Targeting" → SegmentTargetingView.tsx (renamed)
    ├── SegmentMetricsSummary.tsx (updated)
    ├── SegmentBuilder.tsx
    │   ├── 3-mode targeting (unchanged)
    │   ├── AudiencePreview.tsx (unchanged)
    │   ├── SegmentExportControls.tsx (unchanged - primary action)
    │   └── "Save Segment" button (new behavior)
    ├── SegmentTemplateGrid.tsx (renamed, simplified)
    │   └── SegmentTemplateCard.tsx (renamed, simplified)
    └── SavedSegmentsTable.tsx (renamed, repurposed)
```

## UI Flow Summary

1. User selects targeting mode (Life Events / Lifestyle / Product)
2. User configures criteria (event types, pillars, products)
3. Audience Preview shows estimated size and demographics
4. User can:
   - **Export** directly to CSV/JSON for Mailchimp, SendGrid, etc.
   - **Save Segment** for later re-export
5. Templates provide quick-start targeting configurations
6. Saved Segments table allows managing and re-exporting past segments

## Benefits

- Clear focus on segment building and export for external providers
- Removes confusing internal campaign management features
- Aligns with stated goal: "export segments to work with existing providers to send emails or text"
- Simpler, more focused user experience
