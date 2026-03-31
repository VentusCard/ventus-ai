

## Fix AI Chatbot Not Full Height in Default View

### Problem
In `DemoDetailOverlay.tsx` (line 224), the content wrapper for bank-wide nodes uses `overflow-y-auto` without a height constraint. This causes `AnalyticsContainer` (which uses `h-full`) to not properly fill the available space — the chat panel inside it can't stretch to full height.

### Fix — `src/components/demo/DemoDetailOverlay.tsx`

**Line 224**: Change the bank-wide/consumer content wrapper to use `overflow-hidden` instead of `overflow-y-auto`, so the `AnalyticsContainer` manages its own internal scrolling:

```tsx
// Before
<div className={`flex-1 overflow-y-auto ${isBankWide || isConsumer ? '' : 'px-6 pb-6 pt-2'}`}>

// After  
<div className={`flex-1 ${isBankWide || isConsumer ? 'overflow-hidden' : 'overflow-y-auto px-6 pb-6 pt-2'}`}>
```

This ensures the flex child has a constrained height, allowing `AnalyticsContainer` → chat panel → `h-full` chain to work correctly.

### Files changed
1. `src/components/demo/DemoDetailOverlay.tsx` — 1 line

