

## Show Only 3 Action Buttons After Synthesis, Hide Details

### What the user wants
After clicking "Behavioral Intelligence: Ready", the intel panel should:
1. Keep the card full height
2. Hide all the detailed content (rollup pills, life events, risk factors, evidence)
3. Show only the 3 action buttons (Next-Offer, Next-Product, Next Conversation) centered at the bottom
4. When a button is clicked, the screen transitions (phone appears, transactions hide)

### Changes — Single file: `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Hide detail sections when no tab is active after synthesis**: Wrap the rollup pills, life events, risk factors sections (lines 285–423) in a condition: only render when `!synthesisTriggered || activeTab !== null`. When `synthesisTriggered && !activeTab`, these sections are hidden.

2. **Show centered action buttons when synthesisTriggered && !activeTab**: Replace the collapsed content area with 3 large vertically-stacked or centered action buttons (Next-Offer, Next-Product, Next Conversation) using the existing `TAB_ORDER` and `TAB_META`. Style them as prominent cards/buttons filling the empty space.

3. **Keep existing tab bar + content behavior**: When a tab IS clicked (`activeTab` is set), the current tab content renders as before (the panel transition to show phone will already work from the previous layout changes).

4. **Full-height card**: When `synthesisTriggered && !activeTab`, the persona card stays `flex-1` so it fills the panel height, with the 3 buttons centered inside.

### Visual result
- Click "Behavioral Intelligence: Ready" → card fills panel, shows only 3 clean action buttons in the center
- Click "Next-Offer" → transitions to intel+phone layout with offer content

