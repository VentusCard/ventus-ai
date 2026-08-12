# Ventus Core card — match the uploaded reference exactly

Rebuild the Intelligence Core (middle column of the System diagram on `/bankdemo`) so its markup, spacing, colors and animation match the uploaded `SystemOverview.tsx` reference one-for-one.

## What changes visually

- Core panel: `rounded-xl` dark gradient `#0E1626 → #131E31`, 16px padding, white text.
- Header: 20px square-and-dot SVG mark in `#6E9BF0` plus the core title at 14px semibold; muted description line below.
- Column label: mono, uppercase, 9.5px — "Signals · what we detect".
- Each signal becomes a standing section (matching the reference exactly):
  - 3px colored left bar, 7px dot with a soft colored halo, signal name at 12.5px.
  - Right side: mono detection count with "· 24h".
  - Second line: a rolling detection ticker that cycles through live example detections — "event → outcome" with a basis chip (1P / Ext / Both) on the right, rolling up on each change.
- Rotation is staggered per signal (start delay 420ms apart, interval ~2.6s) and disabled when the user prefers reduced motion.

## Behavior kept

Signal rows stay clickable and keep driving the detail panel below; the count and basis values keep coming from the existing signal data.

## Technical notes

- Edit `src/components/tepilot/insights/CapabilitiesView.tsx`: replace the current signal button markup with a `SignalSection` component copied from the reference, wrapped in a button so the existing `selectSignal` click behavior is preserved.
- Add a small `examples` array (3–4 detection pairs) per signal family in the existing `SIGNALS` constant, using real signal families already in the app (Life Events, Financial, Spending Habits, Demographic, Risk) — no new copy conventions.
- Add the `rollup` keyframe + `animate-rollup` utility to the Tailwind config / global CSS, since the reference relies on it and the project does not define it yet.
- No changes to sources, destinations, KPIs, or the detail panel.
