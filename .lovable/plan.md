

## Fix: Only Show Life Events With Product Recommendations

### Problem
The `analyze-lifestyle-signals` edge function returns all detected events — including "standout transaction signals" like `[NOTABLE] Increased Travel and Entertainment Spending` that have no `recommended_funding_sources`. The `NextProductRationale` component renders all of them, even when there's no product to recommend.

### Fix

**File: `src/components/exec-demo/NextProductRationale.tsx`** — ~2 lines

Filter `lifeEvents` before rendering to only include events that have at least one `recommended_funding_source`:

```typescript
const productEvents = lifeEvents.filter(
  e => (e.financial_projection?.recommended_funding_sources?.length ?? 0) > 0
);
```

Then use `productEvents` instead of `lifeEvents` for the count header and the `.map()` rendering loop. This ensures only events with concrete product recommendations (like 529 Plan, HYSA) are shown — behavioral signals without products are silently dropped.

One file, ~3 lines changed.

