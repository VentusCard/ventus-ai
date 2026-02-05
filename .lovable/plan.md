
# Fix Accordion Text Colors in Client Snapshot Panel

## Problem
The accordion section titles in the left panel appear faded/light gray because they're missing explicit color classes. Only "Transaction Overview" has `text-blue-900` - all other sections inherit a default light color.

## Solution
Add `text-blue-900` to all accordion trigger titles for consistency:

### Changes to `src/components/tepilot/advisor-console/ClientSnapshotPanel.tsx`

1. **Detected Life Events** (line 194)
   - Change: `<span className="text-sm font-semibold">Detected Life Events</span>`
   - To: `<span className="text-sm font-semibold text-blue-900">Detected Life Events</span>`

2. **Holdings Overview** (line 265)
   - Change: `<span className="text-sm font-semibold">Holdings Overview</span>`
   - To: `<span className="text-sm font-semibold text-blue-900">Holdings Overview</span>`

3. **Top Spending Categories** (line 367)
   - Change: `<span className="text-sm font-semibold">Top Spending Categories</span>`
   - To: `<span className="text-sm font-semibold text-blue-900">Top Spending Categories</span>`

4. **Compliance & Risk** (line 405)
   - Change: `<span className="text-sm font-semibold">Compliance & Risk</span>`
   - To: `<span className="text-sm font-semibold text-blue-900">Compliance & Risk</span>`

5. **Relationship Milestones** (line 435)
   - Change: `<span className="text-sm font-semibold">Relationship Milestones</span>`
   - To: `<span className="text-sm font-semibold text-blue-900">Relationship Milestones</span>`

This will make all accordion headers consistent with the "Transaction Overview" section's dark blue styling.
