# System Flow as a single-screen status board

Rework the **System Flow** tab so the whole pipeline fits in one viewport with no page scrolling, and every element doubles as a live system status chip.

## What changes

**One screen, no scroll**
- The view becomes a fixed-height column that fills the available panel height (`h-full`, `overflow-hidden`), with the five stages sized to share that height instead of stacking past the fold.
- Stage rows get compact: header line, chips in a single dense row per stage, tighter type/padding, thinner connectors.
- Detail no longer expands inline and pushes the page down. Clicking a chip opens the detail in a fixed right-hand panel beside the flow (the flow column narrows, the detail column scrolls internally). Nothing outside the viewport.
- Stage 2 (engine) collapses to one horizontal 5-step strip.

**Every element is a status chip**
- Each chip gets a status dot plus a compact metric on the right: green = operational, amber = degraded/partial, slate = idle/not run this session.
- Sources: dot + input count and a freshness label (e.g. "39 inputs · live").
- Engine steps: dot + throughput/latency-style readout per step.
- Signal layers: dot + detector count, and how many fired in the current demo session when one exists.
- Teams: dot + workflow count.
- Destinations: dot + delivery state.
- A single header status bar summarizes the pipeline: overall state, providers connected, signals live, last run.

**Live vs static**
- Where the current demo session has real data (`useExecDemoSession`), the chips reflect it — signals detected, whether a run has happened, destinations that received output.
- Where there is no live source, chips show a stable operational state with static readouts. No fabricated numbers beyond what the tab already displays.

## Technical notes

- Only `src/components/tepilot/insights/SystemFlowView.tsx` changes; `CapabilitiesView.tsx` and its exported data stay as-is.
- New local `StatusDot` and `statusFor(...)` helpers inside the file; keep the existing `StageShell` / `Chip` components but restyle them to the denser, status-bearing form and move the `detail` slot out of the stage into the side panel.
- Layout: outer `flex flex-col h-full`, header fixed, body `flex-1 min-h-0 grid grid-cols-[1fr_320px]` with the detail column `overflow-y-auto`; stages inside a `flex-1 min-h-0 flex flex-col justify-between`.
- Session data via `useExecDemoSession()` from `src/lib/execDemoSessionStore.ts`.
- Strict light theme, existing per-signal/per-team tints preserved, no `dark:` utilities.
