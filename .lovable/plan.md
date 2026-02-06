
# Fix Travel Transactions Being Counted as New Pillars

## Problem
Travel transactions are creating new invalid pillars like "Dining Away" and "Travel Essentials" instead of being grouped under **"Travel & Exploration"**. The AI edge function is working correctly, but the client-side code is blindly applying `reclassified_pillar` values without enforcing the travel pillar.

## Root Cause

In `src/hooks/useSSEEnrichment.ts` (lines 281-286), the code applies whatever value the AI returns for `reclassified_pillar`:

```typescript
if (travelUpdate.reclassified_pillar) {
  updated[idx].pillar = travelUpdate.reclassified_pillar;
}
```

When the AI returns `reclassified_pillar: "Dining Away"`, this incorrectly becomes a new pillar instead of a subcategory under Travel.

## Solution

Update the client-side logic to **always use "Travel & Exploration"** as the pillar when `is_travel_related` is true, regardless of what the AI returns for `reclassified_pillar`.

## File to Update

### `src/hooks/useSSEEnrichment.ts`

**Current code (lines 278-286):**
```typescript
// Store original pillar before updating
const originalPillar = updated[idx].pillar;

// Update pillar and subcategory if reclassified
if (travelUpdate.reclassified_pillar) {
  updated[idx].pillar = travelUpdate.reclassified_pillar;
}
if (travelUpdate.reclassified_subcategory) {
  updated[idx].subcategory = travelUpdate.reclassified_subcategory;
}
```

**Updated code:**
```typescript
// Store original pillar before updating
const originalPillar = updated[idx].pillar;

// If travel-related, ALWAYS set pillar to "Travel & Exploration"
// The reclassified values from AI should be used as subcategories only
if (travelUpdate.is_travel_related) {
  updated[idx].pillar = "Travel & Exploration";
  // Use reclassified_subcategory if provided, otherwise use reclassified_pillar as subcategory
  if (travelUpdate.reclassified_subcategory) {
    updated[idx].subcategory = travelUpdate.reclassified_subcategory;
  } else if (travelUpdate.reclassified_pillar) {
    // AI may have put subcategory name in reclassified_pillar field
    updated[idx].subcategory = travelUpdate.reclassified_pillar;
  }
}
```

## Behavior After Fix

| Transaction | AI Returns | Before Fix | After Fix |
|-------------|-----------|------------|-----------|
| Restaurant in Miami during trip | `reclassified_pillar: "Dining Away"` | Pillar: "Dining Away" (wrong) | Pillar: "Travel & Exploration", Subcategory: "Dining Away" |
| Gas station in Vermont | `reclassified_pillar: "Travel Transportation"` | Pillar: "Travel Transportation" (wrong) | Pillar: "Travel & Exploration", Subcategory: "Travel Transportation" |
| Hotel booking | `reclassified_pillar: "Hotels & Lodging"` | Pillar: "Hotels & Lodging" (wrong) | Pillar: "Travel & Exploration", Subcategory: "Hotels & Lodging" |

## Summary

- **1 file change** in `useSSEEnrichment.ts`
- Travel-related transactions will always be grouped under "Travel & Exploration"
- The reclassified value becomes the subcategory, preserving the granularity
- No edge function changes needed
