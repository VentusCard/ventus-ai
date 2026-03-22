

## Tighten Local Experiences Section in Rewards Phone Mockups

### Changes — `src/components/demo/DemoRewardsView.tsx`

#### 1. Compact PerkCard into a single row
Current card has 3 rows (title+tier, tagline, partner+value). Condense to a single-row layout:
- **Left**: category icon (smaller, `h-5 w-5`)
- **Middle**: title (truncated) + partner in muted text on same line separated by `·`
- **Right**: value badge + tier badge inline

Remove the tagline entirely — it's redundant with the title in most cases.

#### 2. Tighten LocalPerksSection spacing
- Reduce section padding from `px-2.5 py-2` to `px-2 py-1.5`
- Reduce card gap from `space-y-1.5` to `space-y-1`
- Collapse section by default (`useState(false)`) to save vertical space
- Remove "perks" count from header — just show `"{city}"` next to the icon

#### 3. Simplify category tabs
- Remove the category icon from tabs — just use text labels, they're already tiny
- Tighten tab padding from `px-2 py-0.5` to `px-1.5 py-0.5`

### Files Modified
- `src/components/demo/DemoRewardsView.tsx`

