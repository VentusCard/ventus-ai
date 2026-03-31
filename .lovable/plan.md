

## Plan: Combine Hero Spotlight + Expiring Soon into One Row

**Layout**: A single flex row where the Hero Spotlight takes 2/3 width and the 3 Expiring Soon cards are vertically stacked in the remaining 1/3.

### Changes (single file: `DemoRewardsView.tsx`)

1. **Wrap Hero + Expiring in a shared row** (lines ~480–493): Replace the two separate sections with a single `<div className="flex gap-2">` container:
   - Left: `HeroSpotlightDeal` in a `w-2/3` wrapper
   - Right: `ExpiringSoonRow` in a `w-1/3` wrapper

2. **Update `ExpiringSoonRow` layout** (lines 225): Change from horizontal `flex gap-1.5 overflow-x-auto` to vertical `flex flex-col gap-1.5`. Remove `shrink-0` from individual cards so they stack naturally.

3. **Compact the expiring cards** slightly — reduce padding to fit 3 cards vertically in the same height as the hero card.

