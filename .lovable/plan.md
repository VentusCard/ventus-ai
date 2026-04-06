

## Fix: Supporting evidence should fill full panel height + restore bottom buttons

### Problem
1. After the last fix removed `flex-1` from the evidence container post-synthesis, the supporting evidence section no longer expands to fill the middle panel — it just takes its natural content height, leaving dead space below.
2. The 3 tab buttons (Analytics / Rewards / Relationship) at the bottom are hidden when `pillsExpanded` is true due to the conditional `{!(synthesisTriggered && pillsExpanded)}`.

### Changes — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Restore full-height evidence when expanded**: When `synthesisTriggered && pillsExpanded`, the persona card should get `flex-1 min-h-0` back so the evidence section fills the remaining panel height, just like before synthesis. The key issue was that the previous fix removed flex-1 unconditionally post-synthesis — it should only be removed when evidence is collapsed (so the tabs + tab content get the space).

   Line 223: Change the class logic so `flex-1 min-h-0` is applied when either (a) synthesis hasn't been triggered, or (b) pills are expanded:
   ```
   !synthesisTriggered || pillsExpanded  →  add "flex-1 min-h-0"
   ```

2. **Also give the chip container `flex-1 min-h-0`** (line 295) when `pillsExpanded` so the scrollable area fills the card.

3. **Show tab bar even when evidence is expanded**: Remove the `!(synthesisTriggered && pillsExpanded)` wrapper around the tab bar. Always show the 3 tab buttons when enrichment is active. Only hide the tab *content* area when evidence is expanded (since the persona card takes all the space).

### Expected result
- Clicking "Supporting evidence" expands chips to fill the full middle panel height (scrollable).
- The 3 navigation buttons remain visible at the bottom at all times.
- Collapsing evidence restores the tab content area below.

