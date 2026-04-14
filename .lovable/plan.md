

## Simplify Current vs. Recommended to a pill row

Replace the complex 3-column grid `CurrentVsRecommended` section with a simple horizontal row of pills showing the customer's current products extracted from transaction sources.

### Change: `src/components/exec-demo/NextProductRationale.tsx`

**Remove** the entire `CurrentVsRecommended` function (~100 lines including the grid layout, matched/unmatched logic, signal connectors, and keyframe animation).

**Replace with** a simple inline pill row:
- Extract unique `source` values from transactions with counts (same logic)
- Render as a single `flex-wrap` row of small pills, each showing: `✓ Source Name (count)`
- Green-tinted pills for current holdings, similar styling to the unmatched pills that already exist at the bottom of the old section
- No columns, no connectors, no signal logic — just a compact row labeled "Current Holdings" above the existing product cards header

The rendering spot stays the same (above the "N product cards generated" line), just drastically simplified.

