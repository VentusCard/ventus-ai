

## Fix: Show Full Intelligence Details After Synthesis

### Problem identified

Two conditions prevent the full content from showing after clicking "Behavioral Intelligence: Ready":

1. **`maxHeight: "45vh"` on line 265** — Applied when `synthesisTriggered && !pillsExpanded`, which includes the `!activeTab` state. This caps the card at 45% viewport height, cutting off content.

2. **Evidence pills hidden (line 484)** — The subcategory chips section only renders when `pillsExpanded || !synthesisTriggered`. After synthesis, the detailed pill breakdown is hidden unless you manually expand.

### Changes — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. **Fix maxHeight (line 265)**: Change from:
   ```
   maxHeight: synthesisTriggered && !pillsExpanded ? "45vh" : undefined
   ```
   To:
   ```
   maxHeight: synthesisTriggered && !pillsExpanded && activeTab ? "45vh" : undefined
   ```
   This lets the card grow to full height when no tab is selected (the "choose an action" state).

2. **Show evidence pills when no tab active (line 484)**: Change from:
   ```
   {(pillsExpanded || !synthesisTriggered) && (
   ```
   To:
   ```
   {(pillsExpanded || !synthesisTriggered || !activeTab) && (
   ```
   This keeps the full subcategory breakdown visible in the pre-tab-click state.

### Visual result
- Click "Behavioral Intelligence: Ready" → full-height card with rollup pills, life events, risk factors, subcategory evidence, AND 3 action buttons at the bottom (all scrollable)
- Click "Next-Offer" → card shrinks to 45vh, evidence collapses, tab content + phone appear

