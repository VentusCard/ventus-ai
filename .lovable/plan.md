## Enlarge product cards and add more relevant data

### What

The two product cards in the Next-Product intelligence panel are currently compact (12px titles, 11px quotes, tiny badges). Scale them up and surface additional context from the matching life event data.

### Changes

**File**: `src/components/exec-demo/NextProductRationale.tsx`

1. **Increase card sizing**:
  - Product name: `text-[12px]` → `text-[14px]`
  - Quote text: `text-[11px]` → `text-[12px]`, increase line height
  - Card padding: `px-3 py-2.5` → `px-4 py-3.5`
  - Trigger pill text: `text-[10px]` → `text-[11px]`
  - Action pill text: `text-[9px]` → `text-[10px]`
  - Row labels: `text-[8px]` → `text-[9px]`
  - Trigger badge: `text-[9px]` → `text-[10px]`
2. **Add contextual data from matching life event** (when available):
  - **Confidence score**: Show as a small percentage bar or badge next to the trigger label (e.g. "92% confidence")
  - **Evidence count**: Show number of supporting transactions (e.g. "Based on 4 transactions")
  - **Talking point**: Display the first talking point from the life event as a short advisor tip beneath the card
3. **Adjust outer spacing**: Increase gap between cards from `space-y-2.5` to `space-y-4` for breathing room.

### Technical detail

All changes in one file. The matching life event (`matchingEvent`) is already resolved at line 181-184. We just need to pull `matchingEvent.confidence`, `matchingEvent.financial_projection`, `matchingEvent.evidence.length`, and `matchingEvent.talking_points[0]` into the card render block.

Estimated ~40 lines changed across the card render section (lines 280-393).