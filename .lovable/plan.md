

## Arrow-Key Navigation for Tab Reveal Phases

### What Changes

After the initial pill compilation (scroll phase) completes, instead of auto-playing through the 3 tab reveals (Analytics → Rewards → Relationship), the demo pauses and lets the user step forward/backward with left/right arrow keys.

**`src/pages/ExecDemoPage.tsx`**

1. **Replace auto-scheduled tab reveals with a step-based model.** After the scroll phase ends, enter a new `"ready"` sub-state (or go straight to `hold` with step index 0). Track a `stepIndex` state (0 = Analytics scan, 1 = Rewards scan, 2 = Relationship scan).

2. **Add a `useEffect` keydown listener** for ArrowRight (advance step) and ArrowLeft (go back a step). Each step triggers the tab reveal logic that currently runs on timers: set `activeTab`, `collectedIndices`, `revealedTabs`, `currentCardColor`, and `phase` for that tab.

3. **Remove the TAB_ORDER scheduling loop** inside `runAnimationWithProfile` (lines ~219-253). Keep the scroll/signal scheduling as-is. After scroll completes + personaPause, transition to `hold` phase and set `stepIndex = 0` to show Analytics.

4. **Step logic:**
   - Right arrow: if `stepIndex < 2`, increment stepIndex, reveal next tab with its card color + indices
   - Left arrow: if `stepIndex > 0`, decrement stepIndex, switch back to previous tab
   - Each step immediately reveals the tab (no scan animation delay — keeps it snappy for manual control)

5. **Visual indicator** — add a subtle "← → Navigate" hint at the bottom of the intel panel or top bar when in hold phase with steps remaining.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

6. Add a small navigation hint (e.g., `"Use ← → to explore"`) below the tab bar when not all tabs are revealed yet.

### Files
- `src/pages/ExecDemoPage.tsx` — replace timer-based tab reveals with step-based arrow key navigation
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — add arrow key navigation hint

