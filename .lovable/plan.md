

# Center Active Content Higher on Screen

## Problem
The active beat content sits in `flex-1 flex items-center justify-center` which centers it in the **remaining** space after the collapsed stack. As more beats stack up top, the "center" shifts down. The content also feels too low overall.

## Solution
Change the active beat container from `items-center` (vertical center) to `items-start` with top padding, so content appears higher and more centrally positioned visually regardless of how many collapsed cards are above.

### Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

1. **Line 166** — Change the active beat container from:
   - `flex-1 flex items-center justify-center px-8 overflow-y-auto`
   - To: `flex-1 flex items-start justify-center px-8 pt-8 overflow-y-auto`
   
   This pushes content toward the top of the remaining space with a small top padding, making it feel higher and more central on the full screen.

2. **Line 138** — Reduce collapsed stack top padding from `pt-20` to `pt-16` to reclaim vertical space for the active content area.

