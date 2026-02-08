
# Segment Export for External Marketing Providers

## Overview

Add export functionality to the Segment Builder that allows targeting teams to export their defined audience segments for use with external email and SMS providers (Mailchimp, SendGrid, Twilio, Klaviyo, etc.). This enables seamless integration with existing marketing workflows without requiring direct platform integrations.

## Current State

- The Segment Builder creates segments based on 3 targeting modes: Life Events, Lifestyle Pillars, and Product Holdings
- Segments calculate an estimated audience size but don't provide exportable customer data
- The "Create Campaign with This Segment" button opens an internal campaign creation dialog
- There is an existing `ExportControls` component (for transaction data) that can be used as a pattern

## Proposed Solution

Add export capabilities to the Segment Builder that generates mock customer contact data matching the segment criteria and exports it in formats compatible with major marketing platforms.

### Export Formats

| Format | Use Case | Providers |
|--------|----------|-----------|
| CSV (Standard) | Universal import | Mailchimp, SendGrid, HubSpot, Salesforce |
| CSV (Mailchimp) | Mailchimp-specific columns | Mailchimp |
| CSV (SendGrid) | SendGrid Marketing | SendGrid |
| JSON | API integrations | Twilio Segment, Custom systems |

### Export Data Fields

Each exported record will include:

| Field | Description |
|-------|-------------|
| `email` | Customer email address |
| `phone` | Phone number (E.164 format for SMS) |
| `first_name` | First name for personalization |
| `last_name` | Last name |
| `segment_name` | Name of the exported segment |
| `targeting_type` | life_event, lifestyle, or product |
| `targeting_criteria` | Specific criteria (e.g., "Retirement Planning") |
| `confidence_score` | Match confidence (for life events) |
| `top_pillar` | Highest spending category |
| `estimated_savings` | Calculated savings for messaging |
| `current_products` | Current product holdings |
| `region` | Geographic region |
| `age_range` | Age bracket |

### UI Changes

1. **Segment Builder**: Add "Export Segment" dropdown button next to "Create Campaign with This Segment"
2. **Export Options**: Dropdown menu with format choices (CSV Standard, CSV Mailchimp, CSV SendGrid, JSON)
3. **Export Dialog**: Optional dialog for configuring export options (sample size, field selection)

## Architecture

```text
SegmentBuilder.tsx
├── AudiencePreview.tsx
└── SegmentExportControls.tsx (new)
    ├── Export format dropdown
    ├── Sample size selector (1K, 5K, 10K, Full)
    └── Field selection checkboxes

lib/segmentExportUtils.ts (new)
├── generateSegmentContacts() - Creates mock contact data
├── exportAsCSV() - Standard CSV export
├── exportAsMailchimpCSV() - Mailchimp-formatted CSV
├── exportAsSendGridCSV() - SendGrid-formatted CSV
└── exportAsJSON() - JSON export for API integrations
```

## Implementation

### New Files

| File | Purpose |
|------|---------|
| `src/components/tepilot/campaigns/SegmentExportControls.tsx` | Export dropdown and controls |
| `src/lib/segmentExportUtils.ts` | Export generation and formatting functions |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/tepilot/campaigns/SegmentBuilder.tsx` | Add SegmentExportControls next to create button |
| `src/components/tepilot/campaigns/AudiencePreview.tsx` | Pass segment data to export controls |

## Technical Details

### Mock Contact Generation

The system will generate realistic mock contact data based on segment criteria:

```typescript
interface SegmentContact {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  segment_name: string;
  targeting_type: TargetingMode;
  targeting_criteria: string;
  confidence_score?: number;
  top_pillar?: string;
  estimated_savings?: number;
  current_products?: string;
  region: string;
  age_range: string;
}

function generateSegmentContacts(
  segment: Partial<AudienceSegment>,
  count: number = 1000
): SegmentContact[] {
  // Generate mock contacts matching segment demographics
  // Use age/region distributions from AudiencePreview
}
```

### Export Format Examples

**Standard CSV:**
```csv
email,phone,first_name,last_name,segment_name,targeting_type,targeting_criteria,region,age_range
john.smith@email.com,+14155551234,John,Smith,Retirement Planning Segment,life_event,Retirement Planning,West,55-64
```

**Mailchimp CSV:**
```csv
Email Address,Phone Number,First Name,Last Name,SEGMENT,TARGETING_TYPE,MERGE_FIELD_1
john.smith@email.com,+14155551234,John,Smith,Retirement Planning Segment,life_event,Retirement Planning
```

**JSON:**
```json
{
  "segment_name": "Retirement Planning Segment",
  "exported_at": "2026-02-08T12:00:00Z",
  "total_contacts": 1000,
  "targeting": {
    "mode": "life_event",
    "criteria": { "eventTypes": ["retirement"], "minConfidence": 0.65 }
  },
  "contacts": [
    { "email": "john.smith@email.com", "phone": "+14155551234", ... }
  ]
}
```

### Export Size Options

| Option | Description |
|--------|-------------|
| Sample (1K) | Quick export for testing |
| Medium (5K) | A/B testing sample |
| Large (10K) | Pilot campaign |
| Custom | User-defined count (up to 100K) |

Note: Full segment exports would require actual customer data - mock data is provided for demonstration purposes.

## UI Design

The export controls will appear as a dropdown button group:

```text
┌─────────────────────────────────────────────────────────────┐
│ Audience Preview                                             │
│ ...existing preview content...                               │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  [Export Segment ▼]    [Create Campaign with This Segment]│
│ │    ├─ CSV (Standard)                                    │ │
│ │    ├─ CSV (Mailchimp)                                   │ │
│ │    ├─ CSV (SendGrid)                                    │ │
│ │    └─ JSON                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

- **No Integration Required**: Works with any email/SMS provider that accepts CSV/JSON imports
- **Flexible Formats**: Pre-formatted exports for popular platforms reduce manual mapping
- **Personalization Ready**: Includes merge fields for dynamic content (top_pillar, savings_estimate)
- **Consistent with Existing Patterns**: Follows the same export approach as the transaction ExportControls component
