# Guided walkthrough for the System flow diagram

Add a small set of navigation buttons above the pipeline board so the diagram can be walked through one beat at a time. Only the selected column stays fully colored and live; the other columns dim to a colorless, static state.

## Beats

1. **Data sources** — left column active
2. **Intelligence Core** — center dark panel active
3. **Activation** — right destinations column active
4. **All** — default state, everything colored and live (current behavior)

## Behavior

- A compact segmented control sits in the board header row: `All · 1 Data sources · 2 Core · 3 Activation`, plus back/forward arrows to step through beats.
- Active column: current colors, animations, hover/selection all unchanged.
- Inactive columns: desaturated (grayscale filter + reduced opacity), animations paused, and non-interactive — no hover, no click-to-open detail.
- The two dotted connectors stay neutral gray and stop animating unless both columns they join are active (i.e. in "All").
- Selecting a beat clears any open detail panel that belonged to a now-inactive column.
- Defaults to "All" on page load, so nothing changes for someone who never touches the control.

## Technical notes

All changes stay in `src/components/tepilot/insights/CapabilitiesView.tsx`:

- New local state `beat: "all" | "sources" | "core" | "destinations"`.
- Helper `columnClass(beat)` returning `grayscale opacity-45 pointer-events-none [&_*]:animate-none` for inactive columns; applied to the three column wrappers.
- `Connector` gains a `muted` prop that forces the gray stroke and drops the dash/pulse animation classes.
- Detail panel: clear `activeSignalLabel` / `activeSourceLabel` when the beat changes away from their column.
- Keyboard: left/right arrow keys on the focused control move between beats; `motion-reduce` behavior unchanged.
