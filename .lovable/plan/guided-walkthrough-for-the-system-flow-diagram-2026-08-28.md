# Guided walkthrough for the System flow diagram

Add a small set of navigation buttons above the pipeline board so the diagram is walked through one beat at a time. The Data sources column is visible and colored by default; 2 more clicks bring the remaining columns to life.

## Beats

- **Default (0 clicks):** Data sources column fully colored and interactive; Intelligence Core and Activation columns greyed out and static.
- **Click 1 — Intelligence Core:** center dark panel comes to color and animation; its incoming connector activates.
- **Click 2 — Activation:** destinations column comes to color; the amber connector activates. All three columns now live — the normal full state.

## Behavior

- A compact control sits in the board header: step buttons `1 Core · 2 Activation` (with a "Data sources" label shown as already-on), plus back/forward arrows and a Reset that returns to the default state.
- Colored columns: current colors, animations, hover/selection unchanged.
- Not-yet-activated columns: grayscale filter + reduced opacity, animations paused, non-interactive.
- Connectors: grey and static until the column to their right activates (arrow for click 1 joining sources→core, amber arrow for click 2 joining core→activation).
- Detail panels can't be opened before their column is colored; resetting or stepping back clears any open detail.
- Keyboard: left/right arrows move between steps when the control is focused; `motion-reduce` still respected.

## Technical notes

All changes stay in `src/components/tepilot/insights/CapabilitiesView.tsx`:

- New state `step: 0 | 1 | 2` (0 = default, sources only).
- Helper `isActive(col)` = `step >= colStep` (sources always on) and a `columnClass` applying `grayscale opacity-45 pointer-events-none [&_*]:animate-none` when inactive.
- `Connector` gains an `active` prop controlling stroke color and dash/pulse animation classes.
- Changing `step` clears `activeSignalLabel` if the core column just deactivated.
