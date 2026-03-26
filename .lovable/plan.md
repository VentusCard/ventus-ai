

## Two Deal Cards Per Row

### Change — `src/components/demo/DemoRewardsView.tsx`

**Line 251**: Change the deal cards container from a vertical stack to a 2-column grid:
```tsx
// Before
<div className="space-y-1.5">

// After
<div className="grid grid-cols-2 gap-1.5">
```

This applies to the enriched deals section (line 251). The fallback/static deals section (line 298+) should get the same treatment for consistency.

Deal card internals stay the same — they'll just render narrower in the 2-col grid. The personalized message may need `line-clamp-2` kept tight to avoid overflow in the narrower cards.

