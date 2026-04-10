

## Replace Current-Month Blue Highlight with a Vertical "Now" Line

### Problem
The current-month cells are highlighted with a blue outline and the month label is blue. The user wants a single vertical line crossing the entire heatmap at the current month instead.

### Changes

**File: `src/components/exec-demo/PurchaseCycleTimeline.tsx`**

1. **Month legend bar (~line 318-331):** Remove the blue color/bold styling on the current month label — all months same style.

2. **Heatmap bars (~line 370-373):** Remove the `outline: isCurrentMonth ? '1.5px solid #3b82f6' : undefined` and the `isCurrentMonth` special background opacity. Treat current month bars the same as any other.

3. **Add a vertical "now" line overlay:** Wrap the rows section (lines 334-416) and the month legend (lines 318-331) in a `relative` container. Add an absolutely-positioned vertical line element whose `left` is calculated as `(CURRENT_MONTH + 0.5) / 12 * 100%`, offset by the same `74px` left padding used for labels. The line will be a thin (1-2px) dashed or solid blue line (`#3b82f6`) spanning the full height of the heatmap area, with a small "Now" label or dot at the top.

### Implementation detail

```
<!-- Pseudo-structure -->
<div className="relative">
  {/* Month legend */}
  {/* Rows */}
  
  {/* Vertical "now" line */}
  <div className="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none"
       style={{ left: `calc(74px + ${(CURRENT_MONTH + 0.5) / 12 * 100}% * (1 - 74px/totalWidth))` }} />
</div>
```

The left offset needs to account for the 66px label column + 8px gap (74px total) and the 72px right status column — the flex-1 bar area sits between those. We'll use a wrapper around just the bar area with `relative` positioning, and place the line inside that wrapper calculated as a simple percentage: `(CURRENT_MONTH + 0.5) / 12 * 100%`.

One file, ~15 lines changed.

