

# Fix: Vertical Padding Above Intent Badge

## Problem
`pt-1` on the flex-1 container has no visible effect because the element fills all remaining vertical space and centers its children. The 4px gap above the badge content is lost.

## Fix

**File**: `src/components/demo/DemoPasswordGate.tsx` (line 388)

Remove `pt-1` from the outer div and add `mt-1` to the inner badge row (line 393), so the margin is on the content itself rather than a flex-expanded container:

- Line 388: Remove `pt-1` from className
- Line 393: Add `mt-1` to the inner `div` className

Alternatively, replace `flex-1` with just `flex` so the container doesn't expand to fill space, allowing `pt-1` to work as intended. This is the cleaner fix since it keeps the padding where you originally placed it and stops the container from stretching.

