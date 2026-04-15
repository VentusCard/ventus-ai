

## Add Collapsed Sliver with Expand Button for Transaction Panel

### What changes
When `activeTab` is set (panel collapses), instead of shrinking to `width: 0`, keep a narrow 40px sliver with a small expand/chevron button. Clicking it temporarily re-expands the transaction panel.

### Changes — `src/pages/ExecDemoPage.tsx`

1. **Add state**: `const [txPanelExpanded, setTxPanelExpanded] = useState(false)`

2. **Reset on tab change**: When `activeTab` changes to null, reset `txPanelExpanded = false`

3. **Update left panel width logic** (line 761):
   - When `!activeTab`: width 400 (full, as now)
   - When `activeTab && txPanelExpanded`: width 400 (re-expanded)
   - When `activeTab && !txPanelExpanded`: width 40 (sliver)

4. **Render sliver content**: When `activeTab && !txPanelExpanded`, show a narrow vertical strip with:
   - A `PanelLeft` or `ChevronRight` icon button centered vertically
   - Subtle vertical text "Transactions" rotated 90° (optional, keeps it clean)
   - On click → `setTxPanelExpanded(true)`

5. **Add collapse button**: When `activeTab && txPanelExpanded`, add a small collapse button at the top of the transaction panel to set `txPanelExpanded(false)`

6. **Opacity**: Keep opacity at 1 for the sliver state (not 0)

### Visual result
- Select an action → left panel shrinks to a 40px sliver with a small expand arrow
- Click the arrow → panel re-expands to show the full transaction list
- Click collapse → returns to sliver

