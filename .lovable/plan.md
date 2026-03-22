

## Map "Category" Instead of "Subcategory" in Personalized UX

### Problem
The expanded pillar cards in `DemoEngagementView.tsx` group transactions by `t.subcategory` (e.g., "Organic & Natural", "Equipment"). Per the classification schema, the correct behavioral grouping should use `t.category` (e.g., "Golf", "Grocery", "Flights").

### Changes — `src/components/demo/DemoEngagementView.tsx`

#### 1. Update `computeSpending` aggregation (lines 42–71)
- Rename the inner map key from `subcats` to `categories`
- Change `t.subcategory` → `t.category` in the grouping logic (lines 49–52)
- Update the output mapping to produce `{ category, count, total }` objects instead of `{ subcategory, ... }`

#### 2. Update `SpendingItem` type (line 37)
- Change `subcategories: { subcategory: string; ... }[]` → `subcategories: { category: string; ... }[]`

#### 3. Update rendering (lines ~275–278)
- Change `sub.subcategory` references to `sub.category` in the expanded card JSX

### Files Modified
- `src/components/demo/DemoEngagementView.tsx`

