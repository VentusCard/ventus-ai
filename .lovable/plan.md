

## Plan: Hide scrollbar on category pills row

**File:** `src/components/demo/DemoRewardsView.tsx` (line 306)

The pills container already has `overflow-x-auto no-scrollbar` but the `no-scrollbar` utility class may not be defined in the project CSS. Fix by adding inline scrollbar-hiding styles directly on the element.

**Change:** Replace the div's className on line 306 to use CSS that hides the scrollbar cross-browser while keeping drag/touch scroll working:

```tsx
<div 
  className="flex gap-1 overflow-x-auto items-center"
  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
>
```

And add a global CSS rule `.no-scrollbar::-webkit-scrollbar { display: none }` in `src/index.css` if not already present — OR just use the inline `style` approach above which avoids needing a global class.

This keeps horizontal drag/touch scrolling functional while hiding the visible scrollbar.

