## Goal
Tighten the `Deals & Perks` view — the parent `TabHeader` plus colored descriptor strips duplicate the child views' own `TabHeader`s (Deal Management, Location Experience Manager already render one). Collapse to a single compact bar.

## Changes

### `src/components/tepilot/insights/DealsAndPerksView.tsx`
- Remove the parent `<TabHeader>` block.
- Remove both colored descriptor strips (blue Shopping / emerald Perks callouts).
- Render only a compact `TabsList` (max-w-md, h-9) as the sole chrome at the top; sub-tab labels stay `Shopping Deals` / `Location Perks` with their icons. Add a one-line `text-xs text-slate-500` hint to the right of the tabs: "Shopping = merchant discounts · Perks = place-based benefits" so the distinction is preserved without a full header.
- Each `TabsContent` renders its child view directly (no wrapper padding beyond `mt-4`); child views keep their existing `TabHeader`.

### No other files touched
- `AvailableDealsGrid` and `LocationExperienceManager` remain untouched — their existing `TabHeader`s now serve as the section header for each sub-tab.

## Verification
- `tsgo --noEmit` clean.
- /bankdemo → Deals & Perks: single compact tab bar; switching tabs shows only the child's own header, no duplicated title strip.
