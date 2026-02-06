
# Sleek White-Themed Scrollbar for Advisor Console

## Overview
Update the scrollbar styling to be sleeker and white-themed for the advisor console panels. The current scrollbar is too thick and uses dark theme colors that clash with the white backgrounds.

## Current Issues
- ScrollArea component uses `bg-border` (dark gray at 15% lightness) for the thumb
- Scrollbar width is `w-2.5` (10px) - too thick
- Light scrollbar styles in `components.css` only target `.tepilot-container` class

## Changes Required

### 1. Update ScrollArea Component
**File: `src/components/ui/scroll-area.tsx`**

Make the default scrollbar thinner and update thumb color to use a lighter, more subtle color:
- Change width from `w-2.5` to `w-1.5` (6px - sleeker)
- Update thumb color from `bg-border` to a light gray (`bg-slate-300`) with hover state (`hover:bg-slate-400`)
- Add smooth transition for hover effect

### 2. Update CSS Scrollbar Styles
**File: `src/styles/components.css`**

Add advisor-console specific scrollbar styling to ensure native scrollbars also match:
- Add `.advisor-console-panel` scrollbar styles
- Use light gray colors (`hsl(220 10% 85%)`) for the thumb
- Keep scrollbar thin (`4px` width)
- Add hover states for better UX

## Technical Details

### ScrollArea Component Changes (scroll-area.tsx)

```tsx
// Current (thick, dark)
"h-full w-2.5 border-l border-l-transparent p-[1px]"
<ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />

// Updated (thin, light)  
"h-full w-1.5 border-l border-l-transparent p-[1px]"
<ScrollAreaThumb className="relative flex-1 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
```

### CSS Additions (components.css)

```css
/* Advisor console light scrollbars */
.advisor-console-panel {
  scrollbar-width: thin;
  scrollbar-color: hsl(220 10% 85%) transparent;
}

.advisor-console-panel::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.advisor-console-panel::-webkit-scrollbar-track {
  background: transparent;
}

.advisor-console-panel::-webkit-scrollbar-thumb {
  background: hsl(220 10% 85%);
  border-radius: 4px;
}

.advisor-console-panel::-webkit-scrollbar-thumb:hover {
  background: hsl(220 10% 70%);
}
```

## Result
- Scrollbars will be 60% thinner (from 10px to 4-6px)
- Light gray color scheme that complements white backgrounds
- Smooth hover transitions for better interactivity
- Consistent styling across both Radix ScrollArea and native scrollbars
