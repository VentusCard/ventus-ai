

## Fix: Keep Persona Description Visible During Tab Phase

### Problem
Line 104 in `ExecDemoIntelPanel.tsx` has `!showTabs` condition, which hides the persona description once the intelligence tabs appear. This was intentional for space-saving but the user wants it always visible.

### Change

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`** (line 104)
- Remove `!showTabs` from the condition: `{displayedDesc && !showTabs && (` → `{displayedDesc && (`
- This keeps the persona description visible throughout all phases (scroll, cardScan, cardCycle, hold)

### Files
1. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — one-line condition fix

