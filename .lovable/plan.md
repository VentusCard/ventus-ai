

# Add Segment-Specific Badge Colors

## Overview
Implement consistent color-coded badges for client segments (Preferred, Private, Premium) across all components in the Advisor Console.

## Current State
- `LifeEventAlertCard.tsx` already has a `segmentColors` mapping:
  - **Preferred**: Blue (bg-blue-100 text-blue-800)
  - **Private**: Purple (bg-purple-100 text-purple-800)  
  - **Premium**: Amber/Gold (bg-amber-100 text-amber-800)
- Other components use generic `variant="outline"` or `variant="secondary"` badges without segment-specific colors

## Implementation Plan

### Step 1: Create Shared Segment Colors Utility
Create a shared utility file to define segment colors once and reuse across all components.

**File:** `src/lib/segmentColors.ts`
- Export a `SEGMENT_COLORS` constant mapping each segment to its color classes
- Export a helper function `getSegmentColorClasses(segment: string)` for easy usage

### Step 2: Update Components to Use Shared Colors

**Files to update:**

1. **ClientSnapshotPanel.tsx** (line 135)
   - Replace `<Badge variant="outline">` with colored badge using segment colors

2. **PrepareEventDialog.tsx** (line 105)
   - Replace `<Badge variant="secondary">` with colored badge

3. **FinancialPlanner.tsx** (line 402)
   - Replace `<Badge variant="secondary">` with colored badge

4. **LifeEventAlertCard.tsx** (lines 30-34)
   - Remove local `segmentColors` definition
   - Import from shared utility

## Technical Details

### Segment Color Mapping
```text
+-----------+--------------------------+
| Segment   | Colors                   |
+-----------+--------------------------+
| Preferred | bg-blue-100 text-blue-800|
| Private   | bg-purple-100 text-purple-800|
| Premium   | bg-amber-100 text-amber-800|
+-----------+--------------------------+
```

### Code Example
```typescript
// src/lib/segmentColors.ts
export const SEGMENT_COLORS: Record<string, string> = {
  Preferred: 'bg-blue-100 text-blue-800 border-blue-200',
  Private: 'bg-purple-100 text-purple-800 border-purple-200',
  Premium: 'bg-amber-100 text-amber-800 border-amber-200',
};

export function getSegmentColorClasses(segment: string): string {
  return SEGMENT_COLORS[segment] || 'bg-slate-100 text-slate-800';
}
```

### Usage in Components
```tsx
import { getSegmentColorClasses } from "@/lib/segmentColors";

<Badge className={cn('text-xs', getSegmentColorClasses(displayData.segment))}>
  {displayData.segment}
</Badge>
```

## Benefits
- Consistent visual language for client segments across the entire application
- Single source of truth for segment colors (easy to update globally)
- Premium clients get a distinctive gold/amber badge that visually communicates their status
- Improved scannability when viewing client lists

