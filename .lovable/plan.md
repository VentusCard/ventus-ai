

## Fix: Supporting evidence section has too much whitespace

### Problem
After synthesis, the evidence container has `flex-1 min-h-0` which stretches it to fill the entire remaining panel height. Since most pills are collapsed (rolled up into the AI rollups), only a few pillar groups remain visible, but they're spread across a tall container with huge gaps.

### Changes — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Remove `flex-1` from the evidence chip container** (line 295): Change from `className="transition-all duration-500 flex-1 min-h-0 overflow-y-auto"` to `className="transition-all duration-500 overflow-y-auto"` — it should only take as much height as its content needs, not stretch.

2. **Hide fully-collapsed pillar groups**: When `synthesisTriggered` and all chips in a pillar are rolled up, skip rendering that pillar group entirely instead of relying on the CSS `pill-collapse` animation (which still reserves layout space). This eliminates the empty rows.

3. **Reduce outer persona card flex-1 when evidence is expanded post-synthesis**: On line 223, when `synthesisTriggered && pillsExpanded`, the card should NOT be `flex-1` — it should be auto-height with `overflow-y-auto` and a reasonable max-height so it doesn't stretch the full panel.

### Expected result
- Supporting evidence shows only the un-collapsed pillar groups tightly packed
- No empty whitespace gaps between pillar rows
- The section scrolls if content exceeds available space

