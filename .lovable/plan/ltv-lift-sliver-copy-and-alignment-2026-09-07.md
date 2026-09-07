# LTV Lift Sliver Copy and Alignment

## Goal
Tighten the collapsed LTV Lift sliver in the three personalization tabs by removing the secondary descriptor line and centering the title vertically within the row.

## What you'll see
- The "Anticipated LTV Lift" title sits alone, vertically centered in the collapsed row.
- The muted driver hint (e.g. "driven by 12 live offers") below the title is removed.
- The headline value pill and chevron remain in the same positions.
- Expanded detail lines below the title remain unchanged.

## Technical details
- File: `src/components/tepilot/insights/personalization/LtvLiftSliver.tsx`
- Remove the `<p>` that renders `result.driverHint` under the title.
- Adjust the title wrapper so the title is vertically centered in the collapsed row (e.g. remove top/bottom margin offsets and keep the row flex-aligned).
- Keep the reset-on-customer-change effect and expansion animation as-is.

## Acceptance criteria
- Collapsed sliver shows only the icon, centered "Anticipated LTV Lift" title, value pill, and chevron.
- No descriptor text appears below the title in collapsed or expanded states.
- Typecheck and build pass; no console errors on `/bankdemo` personalization tabs.
