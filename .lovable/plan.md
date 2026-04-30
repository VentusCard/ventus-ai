## Goal

In the Behavioral Intelligence panel, render each section as a single horizontal row: the header label sits on the left, and its pills sit immediately to its right on the same row.

Currently (`src/components/exec-demo/ExecDemoIntelPanel.tsx`, ~lines 673–688), each section is a stacked block:

```text
SPENDING HABITS
[pill] [pill] [pill] [pill]

LIFE EVENT DETECTION
[pill] [pill]

RISK FACTORS
[pill] [pill]
```

Target:

```text
Spending Habits:        [pill] [pill] [pill] [pill] →
Life Event Detection:   [pill] [pill] →
Risk Factors:           [pill] [pill] →
```

## Changes

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx` (expanded layout block ~lines 673–688)

For each of the three sections (Spending Habits, Life Event Detection, Risk Factors):

- Replace the stacked `div > p + div` with a single flex row: `flex items-center gap-3`.
- Header becomes a fixed-width, non-shrinking label (`shrink-0`, ~160px) keeping the existing colored uppercase styling, with a trailing colon.
- Pills container becomes `flex flex-nowrap gap-2 overflow-x-auto` so pills stay on one line; horizontal scroll handles overflow within the panel width. Use the existing `exec-light-scroll` class for consistent thin scrollbar styling, and add `min-w-0` so the flex child can actually shrink/scroll.
- Keep entrance fade-in animations and existing pill components untouched.
- The collapsed view (`isCollapsed`) keeps its current single wrapping row — no change.

No other files, edge functions, or data flow changes. Pill content, click behavior, colors, and ordering all remain identical.
