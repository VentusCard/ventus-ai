

# Dynamic Vertical Centering for Active Content

## Problem
Static `pt-24` doesn't adapt — on Beat 1 (no collapsed stack) the content should be vertically centered, but on later beats (with a growing stack above) the fixed padding pushes content too low or leaves it too high.

## Solution
Use `items-center` for vertical centering by default, but dynamically adjust based on the step. The key insight: when `step === 0`, the collapsed stack doesn't exist, so `flex-1 items-center` naturally centers content. On later steps, the collapsed stack takes space and `items-center` centers in the *remaining* space — which is correct behavior.

**File**: `src/components/demo/DemoPasswordGate.tsx`

**Line 181** — Change from static `items-start pt-24` back to dynamic centering:
```
<div className="flex-1 flex items-center justify-center px-8 overflow-y-auto">
```

This uses flexbox's natural centering in the remaining space after the collapsed stack. Since the outer container is `flex flex-col h-screen`, the active beat area gets `flex-1` (all remaining height), and `items-center` centers the content within that remaining space — automatically adapting as the stack grows.

The previous issue was likely that `pt-20` on the stack was too much. With `pt-16` already applied, the centering should work properly now.

