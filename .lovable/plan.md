# Life Events family expanded by default

On the Intelligence Database overview, the five signal-family tiles start collapsed and the detail panel only appears after a click. Make the Life Events family open by default.

## What changes

- When the overview loads, the Life Events detail panel is already open instead of the five collapsed tiles.
- The panel's existing family switcher still lets the user jump to Spending Habits, Financial, Demographic, or Risk, and closing it returns to the five-tile grid.
- No other behavior, copy, or styling changes.

## Technical notes

- `src/components/tepilot/insights/dashboard/SignalFamilyBoard.tsx`: initialize the `expanded` state to `"life_event"` instead of `null`.
