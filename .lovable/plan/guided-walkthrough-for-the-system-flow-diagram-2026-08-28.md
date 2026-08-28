# Guided walkthrough for the System flow diagram

Add a small set of navigation buttons above the pipeline board so the diagram is walked through one beat at a time. It starts fully greyed out, and each click brings the next column to life — 3 clicks until everything is colored.

## Beats

- **Start (0 clicks):** all three columns greyed out and static; nothing is clickable except the step control.
- **Click 1 — Data sources:** left column comes to color and becomes interactive.
- **Click 2 — Intelligence Core:** center dark panel comes to color (sources stay colored).
- **Click 3 — Activation:** destinations column comes to color. All three columns now live — the normal full state.

## Behavior

- A compact control sits in the board header: numbered step buttons `1 Data sources · 2 Core · 3 Activation`, plus back/forward arrows and a Reset that returns to the greyed-out start.
- Colored columns: current colors, animations, hover/selection unchanged.
- Not-yet-activated columns: grayscale filter + reduced opacity, animations paused, non-interactive.
- Connectors: grey and static until both columns they join are colored; the connector animates only once its right-hand column activates (arrow for 2 joins sources→core, amber arrow for 3 joins core→activation).
- Detail panels can't be opened before their column is colored; resetting or stepping back clears any open detail.
- Keyboard: left/right arrows move between steps when the control is focused; `motion-reduce` still respected.

## Technical notes

All changes stay in `src/components/tepilot/insights/CapabilitiesView.tsx`:

- New state `step: 0 | 1 | 2 | 3` (0 = all grey).
- Helper `isActive(col)` = `step >= colStep` and a `columnClass` applying `grayscale opacity-45 pointer-events-none [&_*]:animate-none` when inactive.
- `Connector` gains an `active` prop controlling stroke color and dash/pulse animation classes.
- Changing `step` clears `activeSignalLabel` / `activeSourceLabel` if their column just deactivated.
