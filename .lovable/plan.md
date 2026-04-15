

## Show Full Details After Synthesis, Collapse Only on Tab Click

### What changes

Currently, clicking "Behavioral Intelligence: Ready" hides all detail and shows only 3 action buttons. The user wants the opposite: keep the full transaction evidence visible after synthesis, with the 3 action buttons added at the bottom. Only when a button is clicked should the panel shrink and the layout transition happen.

### Changes — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Remove the action-buttons-only branch** (lines 285–320): Delete the `synthesisTriggered && !activeTab` condition that renders only the 3 centered buttons and hides everything else.

2. **Always show the rollup pills + life events + risk factors after synthesis**: The existing `synthesisTriggered && rollupStats.length > 0` branch (lines 321–458) should render when `synthesisTriggered` is true regardless of `activeTab`. This means the condition on line 285 changes from checking `!activeTab` to just falling through to the detail view.

3. **Add the 3 action buttons below the risk factors section** (after line 457): When `synthesisTriggered && !activeTab`, render the 3 action buttons (Next-Offer, Next-Product, Next Conversation) in a horizontal row below the risk section. Use a compact horizontal layout (not the tall centered layout) so they sit naturally below the intelligence summary.

4. **Keep the card full-height when `synthesisTriggered && !activeTab`**: The persona card wrapper (line 259) already uses `flex-1 min-h-0` when `!synthesisTriggered || pillsExpanded`. Extend this to also apply when `synthesisTriggered && !activeTab`, so the card fills the panel and the evidence is scrollable.

### Visual result
- Click "Behavioral Intelligence: Ready" → card fills panel, shows rollup pills, life events, risk factors, evidence list, AND 3 action buttons at the bottom
- Click "Next-Offer" → card shrinks, left panel hides, phone appears (existing behavior)

