# Remove Unit Economics Card; Key Features Full Height

## Goal
In the three /bankdemo personalization tabs (Personalized Deals, Product, Relationship), remove the Unit economics card from the right column so the Key features card takes the column's full height.

## Current state
- `SurfaceFeaturePanel.tsx` renders a right column with two stacked cards: Key features (`flex-1`) and `UnitEconomicsCard` below it.
- `UnitEconomicsCard` is used only by `SurfaceFeaturePanel.tsx` (verified — no other imports).

## Proposed change
1. In `SurfaceFeaturePanel.tsx`, remove the `<UnitEconomicsCard surface={surface} />` render and its import.
2. The Key features card already uses `flex-1 min-h-0` with `flex-1` feature rows, so it will naturally expand to fill the full column height — no layout changes needed beyond removing the sibling card.
3. Delete `src/components/tepilot/insights/personalization/UnitEconomicsCard.tsx` (orphaned after removal).
4. Leave `src/lib/personalizationUnitEconomics.ts` in place for now (shared library; only referenced by the deleted card — will confirm and remove if truly unused, otherwise keep).

## Verification
- TypeScript + production build pass.
- Playwright: on each of the three personalization tabs, confirm the right column shows only the Key features card, filling the full height to match the other two columns.
