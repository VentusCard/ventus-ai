## Goal

On `/demo`, when a user has entered any of the 3 next- tabs (Next-Offer / Next-Product / Next-Conversation), move the 3-button tab switcher to sit ABOVE the persona/pills card instead of below it.

## Current Layout (within a selected tab)

```text
┌─────────────────────────────────────┐
│ Persona + Rollup/Trigger Pills card │  ← scrollable, ~45vh max
├─────────────────────────────────────┤
│ [Next-Offer] [Next-Product] [Next-C]│  ← tab switcher (3 buttons)
├─────────────────────────────────────┤
│ Tab content (rationale view)        │
└─────────────────────────────────────┘
```

## Target Layout

```text
┌─────────────────────────────────────┐
│ [Next-Offer] [Next-Product] [Next-C]│  ← moved up
├─────────────────────────────────────┤
│ Persona + Rollup/Trigger Pills card │
├─────────────────────────────────────┤
│ Tab content (rationale view)        │
└─────────────────────────────────────┘
```

The pre-tab state (the row of 3 large action buttons shown before any tab is selected, lines 740-764) is unchanged.

## Implementation

File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`

1. Move the tab-bar block (currently lines 766-791, the `{showProfile && phase !== "idle" && activeTab && (...)}` segment) to render BEFORE the persona/pills card container (currently starting at line 361).
2. Keep all behavior, styling, and conditions identical — only the DOM order changes.
3. Leave the unselected-state action buttons (lines 740-764) and tab content block (794+) where they are.

No other files need changes.