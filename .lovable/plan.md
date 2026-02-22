

# Use Semantic AI for Preset Template Application

## Overview
Instead of hardcoding pillar/product/strategy mappings in each template's data, route preset template clicks through the same `parse-campaign-intent` edge function. When a user clicks a preset like "New Parents", we send its name + description to the AI, which returns the structured dimensions. This makes presets future-proof -- changing a template's name or description automatically updates what gets selected.

## Changes

### 1. `src/components/tepilot/campaigns/CampaignStudio.tsx`

Replace `handleApplyTemplate` logic:
- Instead of reading hardcoded `suggestedAudience` fields, construct a natural language string from the template's `name` + `description` + `category`
- Call `supabase.functions.invoke('parse-campaign-intent', { body: { intent } })` 
- Feed the result through the existing `handleIntentParsed` callback (same path as the semantic text input)
- Show a loading toast while the AI processes
- Keep the template's `estimatedSize` for the success toast

Do the same for `handleEditSegment` -- construct a prompt from the saved segment's name + targeting mode and run it through the AI.

### 2. `src/lib/segmentData.ts`

Strip out the enriched `lifestyleCriteria`, `productCriteria`, and `demographicFilters` that were just added to templates -- the AI will infer these dynamically. Keep only:
- `name`, `description`, `category`, `estimatedSize`
- `suggestedAudience.targetingMode` (for display purposes)
- `suggestedGoal` (as a hint in the prompt)

This keeps the template data lean and maintainable.

### 3. `src/types/segment.ts`

No changes needed -- the `SegmentTemplate` type already has optional fields, so removing the data won't break types.

## Technical Details

### Prompt Construction for Templates
When a preset is clicked, build a prompt like:
```
"Campaign for: New Parents. Category: life_event. 
Description: Target customers showing family growth signals. 
Goal: life_event targeting."
```
This gives the AI enough context to infer the right pillars, products, life events, and strategies.

### Prompt Construction for Saved Segments
```
"Campaign for: High-Value Travelers. Targeting mode: lifestyle. 
Description: Frequent travelers with premium spending patterns."
```

### Flow
1. User clicks preset row
2. Show loading spinner on that row (or a toast)
3. Call `parse-campaign-intent` with constructed prompt
4. On success, call `handleIntentParsed(result)` which sets all state and triggers brief generation
5. Toast success with template name

### Error Handling
If the AI call fails, fall back to whatever hardcoded data exists in `suggestedAudience` (the current behavior), so templates still work offline or if the edge function is down.

## Files Modified

| File | Change |
|---|---|
| `src/components/tepilot/campaigns/CampaignStudio.tsx` | Rewrite `handleApplyTemplate` and `handleEditSegment` to call `parse-campaign-intent` edge function, with fallback to hardcoded data |
| `src/lib/segmentData.ts` | Simplify templates back to lean data (remove enriched criteria that AI will now infer) |

