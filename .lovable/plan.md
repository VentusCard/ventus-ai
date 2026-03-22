

## Changes — `src/components/demo/DemoRewardsView.tsx`

### 1. Expand by default
Change `useState(false)` to `useState(true)` on line 153.

### 2. Category pills match category icon color
Currently all active pills use the section's `color` prop. Instead, extract a hex color from each category's `CATEGORY_CONFIG` color class and use it for the active pill background.

- Parse the Tailwind class in `CATEGORY_CONFIG[cat].color` to extract the text color (e.g. `text-green-600` → a green hex).
- Create a small lookup map `CATEGORY_HEX` mapping each `PerkCategory` to a hex color (e.g. Sports → `#16a34a`, Art → `#4f46e5`, etc.).
- For the "All" pill, keep using the section `color` prop.
- For each category pill, when active use `background: CATEGORY_HEX[cat]` instead of `background: color`.

### Files Modified
- `src/components/demo/DemoRewardsView.tsx`

