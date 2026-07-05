## Fix: Reduce vertical whitespace around Location Perks filters row

### Problem
The filters row (search bar + city/category dropdowns + "Add Experience" button) in the Location Perks tab has excessive whitespace above and below it, making the section feel too spread out vertically.

### Root cause
The outer container uses `space-y-6` (24px gaps between each child: TabHeader → filters row → city groups). The `TabHeader` itself also adds `pb-3 mb-4`, compounding the spacing.

### Fix
In `src/components/tepilot/insights/LocationExperienceManager.tsx`:
1. Change the outer container from `space-y-6` to `space-y-3` (line 107).
2. Keep all other styling and layout unchanged.

This halves the gap between the TabHeader, filters row, and city groups from 24px to 12px, tightening the section without crowding content.

### Verification
- Build passes (`tsgo --noEmit`).
- Visual check confirms the filters row sits closer to the header above and the city cards below.