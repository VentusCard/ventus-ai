

# Make Campaign Studio the Main Content with Integrated Presets and Saved Segments

## Overview
Consolidate the entire Segment Targeting view so that the Campaign Studio is the only top-level content. The separate `SegmentMetricsSummary`, `SegmentTemplateGrid`, and `SavedSegmentsTable` sections will be absorbed into the Campaign Studio itself -- metrics become a compact header row, templates become a collapsible "Presets" section in the left column, and saved segments become a collapsible section in the left column as well.

## What Changes

### Current Layout (4 separate sections stacked vertically)
```text
[Intro Banner]
[Metrics Summary - 4 cards]
[Campaign Studio - two-column card]
[Segment Template Grid - filterable card grid]
[Saved Segments Table - table card]
```

### New Layout (Campaign Studio is everything)
```text
[Campaign Studio]
  Header: Title + inline metrics (4 small stat badges)
  Two-column layout:
    LEFT COLUMN:
      [Preset Templates] (collapsible, compact cards with "Apply" button)
      [Saved Segments] (collapsible, compact list with Edit/Export actions)
      --- separator ---
      [Lifestyle Pillars]
      [Life Events]
      [Banking Products]
      [Geography]
      [Demographics]
      [Strategies]
      [Campaign Goal]
      [Audience Estimate Bar]
    RIGHT COLUMN:
      [AI Campaign Brief Preview] (sticky, unchanged)
```

## Detailed Changes

### 1. `SegmentTargetingView.tsx` -- Simplify to just render CampaignStudio
- Remove imports of `SegmentMetricsSummary`, `SegmentTemplateGrid`, `SavedSegmentsTable`
- Remove the intro banner (move it into the CampaignStudio header)
- Remove template/segment handler functions
- The view becomes a thin wrapper that just renders `<CampaignStudio />`

### 2. `CampaignStudio.tsx` -- Absorb all content
- **Header**: Replace the current simple header with a richer one that includes the intro text plus 4 inline metric badges (Saved Segments count, Total Contacts, Total Exports, Active Modes) pulled from `getSegmentMetricsSummary()`
- **Left Column -- Add Presets section at top**: A new collapsible `DimensionChipCloud`-style section titled "Preset Templates" that renders `SEGMENT_TEMPLATES` as compact mini-cards. Each card shows icon + name + estimated size + "Apply" button. Clicking "Apply" populates the relevant dimension state (pillars, life events, products, demographics) from the template's `suggestedAudience`. Category filter tabs (All, Life Events, Lifestyle, Cross-Sell, Seasonal) shown as small chips inside the collapsible.
- **Left Column -- Add Saved Segments section**: A collapsible section titled "Saved Segments" with a compact list of `SAVED_SEGMENTS`. Each row shows name, mode badge, estimated size, and a small dropdown for Edit/Export/Delete actions. Clicking "Edit" loads the segment criteria into the studio state.
- **Separator**: A subtle `Separator` divider between the presets/saved sections and the dimension selectors

### 3. No changes to the right column (AICampaignPreview)
The AI preview panel remains exactly as-is.

## Files to Modify

| File | Change |
|---|---|
| `src/components/tepilot/campaigns/SegmentTargetingView.tsx` | Strip down to only render `<CampaignStudio />`, remove all other imports and handlers |
| `src/components/tepilot/campaigns/CampaignStudio.tsx` | Add inline metrics header, integrate preset templates section with category filtering and "Apply" logic, integrate saved segments list with edit/export/delete actions, add separator between presets and dimension selectors |

## Technical Details

### Preset "Apply" Logic
When a user clicks "Apply" on a template card, the handler reads `template.suggestedAudience` and sets the corresponding state:
- `targetingMode === 'life_event'`: sets `lifeEventCriteria` from `template.suggestedAudience.lifeEventCriteria`, sets `demographicFilters` if present
- `targetingMode === 'lifestyle'`: sets `selectedPillars` from `lifestyleCriteria.pillars`
- `targetingMode === 'product'`: sets `selectedProducts` from `productCriteria.hasProducts` (as "has") and `productCriteria.lacksProducts` (as "lacks")
- Clears other dimensions to avoid confusing cross-state
- Shows toast confirming which preset was applied

### Saved Segment "Edit" Logic
Reads the segment's `targetingMode` and criteria fields, maps them to studio state the same way as presets, then shows a toast.

### Inline Metrics
Four small `Badge` components in the header row showing:
- `4 Saved` (bookmark icon)
- `21.2M Contacts` (users icon)
- `10 Exports` (download icon)
- `3 Modes Active` (target icon)

These are computed from `getSegmentMetricsSummary()` and rendered inline next to the title, replacing the separate 4-card grid.

### Preset Template Mini-Cards
Rendered inside a `Collapsible` section. Each card is a compact horizontal row (not the full `SegmentTemplateCard`):
```text
[Icon] New Parents  |  4.1M  |  [Apply]
```
With category filter chips (All | Life Events | Lifestyle | Cross-Sell | Seasonal) above the list, styled as small pills similar to the existing dimension chips.

### Saved Segments Compact List
Rendered inside a `Collapsible` section. Each row:
```text
[Icon] Travel-Heavy Cashback Users  |  [Product]  |  8.2M  |  [...menu]
```
The dropdown menu reuses the same export/edit/delete actions from the current `SavedSegmentsTable`.

