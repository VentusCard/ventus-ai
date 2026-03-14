

# Beat 5: Full-Width Columns with Single-Line Cards

## Problem
The left (input) and right (output/carousel) columns are fixed at `260px` width, and long card labels like "Geo-Targeted Merchant Partnerships" may wrap to two lines.

## Fix

**File**: `src/components/demo/DemoPasswordGate.tsx`

1. **Remove fixed widths** on both columns and the header labels. Replace `minWidth: 260, width: 260` with `flex: 1, minWidth: 0` so they fill available space equally.

2. **Update the layout container** (line 436): change `gap-4 sm:gap-6` to a tighter gap and ensure `w-full` is set.

3. **Header labels** (lines 428, 432): remove `minWidth: 260, width: 260` and `max-w-[220px]`, use `flex-1 min-w-0` instead.

4. **Left column** (line 439): change `style={{ minWidth: 260, width: 260 }}` → `className="flex-1 min-w-0"`.

5. **Right column** (line 488): change `style={{ minWidth: 260, width: 260, ... }}` → use `flex-1 min-w-0` plus keep the position/height styles.

6. **Force single-line** on all card labels: add `whitespace-nowrap` to the label `<span>` elements in both static labels (line 510) and carousel cards (line 550).

