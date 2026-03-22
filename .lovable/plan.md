

## Fix Perk Value Badge Colors

### Problem
The value badges (e.g. "$175/game") in `PerkCard` use the section-level `color` prop (blue or green) instead of matching their category icon color.

### Fix — `src/components/demo/DemoRewardsView.tsx`

Update `PerkCard` to accept the perk's category and use `CATEGORY_HEX[perk.category]` for the value badge color instead of the generic `color` prop.

**Current** (line ~131):
```tsx
style={{ background: `${color}12`, color }}
```

**New**:
```tsx
const catHex = CATEGORY_HEX[perk.category] || color;
// ...
style={{ background: `${catHex}12`, color: catHex }}
```

This reuses the existing `CATEGORY_HEX` map already defined in the file, so Sports perks get green (`#16a34a`), Art gets indigo, etc.

### Files Modified
- `src/components/demo/DemoRewardsView.tsx`

