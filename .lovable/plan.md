
# Plan: Add "Ventus Insights" Section to Prepare Event Dialog

## Overview
Add a new "Ventus Insights" section to the left of "Recommended Next Steps" that will display a holistic lifestyle summary of the client in natural language. For now, this will be a placeholder with mock content - the edge function will be built later.

## Layout Change

Current layout (stacked vertically):
```text
┌─────────────────────────────────────────┐
│ Detected Supporting Transactions        │
├─────────────────────────────────────────┤
│ Recommended Next Steps                  │
└─────────────────────────────────────────┘
```

New layout (two-column for bottom section):
```text
┌─────────────────────────────────────────┐
│ Detected Supporting Transactions        │
├───────────────────┬─────────────────────┤
│ Ventus Insights   │ Recommended Steps   │
│ (left column)     │ (right column)      │
└───────────────────┴─────────────────────┘
```

## Changes

**File:** `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`

1. **Add Sparkles icon import** from lucide-react for the Ventus Insights header

2. **Add placeholder insight text** - Mock natural language summary based on event type that describes the client's lifestyle picture

3. **Create two-column grid layout** below transactions:
   - Left column: "Ventus Insights" with a Sparkles icon and placeholder paragraph text
   - Right column: Existing "Recommended Next Steps" list

## Technical Details

```tsx
// Add to imports
import { Sparkles } from "lucide-react";

// Mock insights by event type (placeholder until edge function)
const mockInsightsByEventType: Record<DetectedLifeEvent['eventType'], string> = {
  retirement: "Based on recent transaction patterns, this client appears to be actively preparing for retirement...",
  // ... other event types
};

// New two-column layout structure
<div className="grid grid-cols-2 gap-6">
  {/* Ventus Insights - Left */}
  <div>
    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-amber-500" />
      Ventus Insights
    </h3>
    <p className="text-sm text-slate-600 leading-relaxed">
      {mockInsightsByEventType[event.eventType]}
    </p>
  </div>
  
  {/* Recommended Next Steps - Right */}
  <div>
    {/* existing content */}
  </div>
</div>
```
