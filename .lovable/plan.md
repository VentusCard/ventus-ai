

## Plan: Update Pillar Names and Add Expanded Subcategories

**File: `src/components/PlatformTabs.tsx`** (lines 162-205)

1. **Update pillars** to Food, Travel, Active Living, Wellness
2. **Food** and **Travel** render as expanded cards (taller, with subcategory rows below the progress bar)
3. **Active Living** and **Wellness** stay compact (current style)

**Pillar data:**
```
Food:      🍽️  $620 / $700  — expanded with: Groceries ($340), Cafes ($180), Delivery ($100)
Travel:    ✈️  $1,240 / $1,500 — expanded with: Trip to New York ($520), Trip to Rome ($480), Trip to Banff ($240)
Active Living: 🏃  $280 / $350  — compact
Wellness:  💆  $320 / $250  — compact (over budget, red bar)
```

**Expanded card structure** — same card styling, but after the spend/budget line, add a `border-t` divider and 3 subcategory rows (label + amount, `text-[8px]`), matching the expandable subcategory style from `DemoEngagementView.tsx`.

Also update the lifestyle banner text from "Dining & Wellness" to "Food & Travel".

