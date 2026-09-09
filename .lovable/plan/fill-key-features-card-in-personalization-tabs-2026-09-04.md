# Fill Key Features Card in Personalization Tabs

## Goal
Make the Key features card in each of the three /bankdemo personalization tabs (Personalized Deals, Product, Relationship) use its full available vertical height instead of leaving empty space beneath the four feature rows.

## Current state
- `SurfaceFeaturePanel.tsx` renders a scrollable list of four compact feature rows inside a flex-1 card.
- The rows sit near the top of the card with unused whitespace below them.
- The same component is shared across all three surfaces, so one change covers all three tabs.

## Proposed change
1. In `SurfaceFeaturePanel.tsx`, change the feature-list body from a simple scrollable stack to a flex column that distributes space.
2. Make each feature row grow to occupy an equal share of the remaining card height (e.g., `flex-1` per row with consistent internal padding).
3. Keep the row content top-aligned so the label/detail remain readable, and preserve the existing reveal animation and disabled-state styling.
4. Keep `UnitEconomicsCard` unchanged below the Key features card.

## Verification
- Run TypeScript and production build.
- Use Playwright to capture the right-hand column on each of the three personalization tabs and confirm the feature rows now fill the card with no large empty gap.
