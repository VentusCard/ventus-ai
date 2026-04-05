

## Fix: Show Transaction Preview for Custom Customer in Idle State

### Problem
When a custom customer is loaded via the paste flow, the left panel's transaction feed still shows "Click Run Analysis to begin..." because the idle-phase code only renders that placeholder text. The transactions are parsed and stored in `profile.transactions`, but the UI never renders them until the animation starts.

### Changes

**`src/components/exec-demo/ExecDemoLeftPanel.tsx`**
- Update the `phase === "idle"` block to check if there are transactions available (i.e., `isCustomMode && transactions.length > 0`)
- When custom transactions exist in idle state, render a static scrollable list of `TxRow` components (dimmed, no animation) as a preview
- Keep the "Click Run Analysis to begin..." text only when there are no transactions to show (i.e., pre-built customers in idle, or custom with no data yet)

### Files
1. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — add transaction preview rendering in idle phase for custom mode

