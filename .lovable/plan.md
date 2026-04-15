

## Add missing demographics fields to profile card

The profile card currently shows two lines but omits `familyStatus` and `industry`. Fix by splitting into three lines and removing `truncate` so nothing gets clipped:

### Change: `src/components/exec-demo/ExecDemoLeftPanel.tsx` (lines 227-234)

Replace the demographics block with three lines:
- **Line 1**: Age · Occupation · Family Status
- **Line 2**: Segment · AUM
- **Line 3**: Income · Industry

Remove `truncate` class from all three lines so long values like "Married, 2 Children" display fully.

