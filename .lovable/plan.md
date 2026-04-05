

## Fix: Prevent Page Extension When Intelligence Tabs Appear

### Problem
When the card cycle phase begins and the intelligence tabs render below the persona pill accumulator, the combined content exceeds the viewport height, causing the page to extend/scroll. The layout should remain fixed to the viewport at all times.

### Changes

**`src/pages/ExecDemoPage.tsx`**
- Change `min-h-screen` to `h-screen` on the outer container so the page never extends beyond the viewport
- Ensure the grid uses `overflow-hidden` properly

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- When tabs appear (cardCycle/cardScan/hold), collapse the persona card to a compact summary (shrink `max-h` of signal rows from 140px to ~60px, hide the description text)
- Add a smooth transition so the persona section shrinks gracefully as the tabs slide in
- Ensure the tab content area uses `flex-1 min-h-0 overflow-auto` to fill remaining space without pushing the layout

### Files
1. `src/pages/ExecDemoPage.tsx` — `h-screen` instead of `min-h-screen`
2. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — collapse persona card during tab phases, constrain heights

