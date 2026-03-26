

## Plan: Merge Achievement + Spending Cards into One Row

Currently the Achievement card and Coaching Tip card each take a full row below the pillar grid. We'll put them side by side in a `grid grid-cols-2 gap-1.5` row to save vertical space, giving the pillar cards above more visual room.

### Changes

**File:** `src/components/demo/DemoEngagementView.tsx` (lines ~292–363)

- Wrap the Achievement card (lines 293–323) and the Coaching Tip card (lines 326–363) in a single `<div className="grid grid-cols-2 gap-1.5">` container
- Each card becomes one column of the row
- Both cards keep their existing styling, just placed side by side
- The pillar spending grid above (grid-cols-2) remains unchanged but benefits from the recovered vertical space

