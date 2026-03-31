## Plan: Pills filter full deal library, personalized deals visually distinguished

### Current behavior

- `CategoryFilterPills` only shows pillars that exist in the ~10 personalized deals
- When a pillar is selected, it already pulls from the full `AVAILABLE_DEALS` library (line 427), but when no filter is active it only shows personalized deals

### Changes

**File: `src/components/demo/DemoRewardsView.tsx**`

1. **Show all 10 pillar pills always** — remove the `cats.has(p.key)` filter in `CategoryFilterPills` so all `DEAL_CATEGORY_PILLS` render regardless of which deals are personalized.
2. Visually differentiate pills with personalied deals: for the pillars that have personalized deals, show a different color background for more "pop"
3. **Filter from full library by default when a pill is clicked** — already works (line 426-431). No change needed.
4. **Pass personalized deal IDs down** — create a `Set` of the original personalized deal IDs so the grid renderer can check membership efficiently.

### Technical detail

- `CategoryFilterPills`: change `availableCategories` memo to simply return `DEAL_CATEGORY_PILLS` (all pillars)
- In the grid, add: `const personalizedIds = new Set(deals.map(d => d.id));`
- Card wrapper gets conditional classes: `border-l-2` with `borderLeftColor: color` when `personalizedIds.has(deal.id)`, plus a small "For You" chip