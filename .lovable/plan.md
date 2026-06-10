# Make Personalized Banking pills blue

Scope: `VentusPill` in `src/components/tepilot/insights/CapabilitiesView.tsx` only.

## Change

Swap the white pill for the same dark blue/indigo gradient used by the Ventus core card.

- Card background: `bg-gradient-to-br from-blue-900 to-indigo-900` (matches core).
- Border: `border-indigo-700` (drop the white left-accent — now redundant on dark bg; keep a subtle `border-l-2 border-l-indigo-300` instead for continuity).
- Text label: `text-white` → bright on dark.
- Icon chip: invert to `bg-white/10` with `text-white` icon (icons need to read on dark; keeping the dark chip on dark bg would disappear).
- Hover: `hover:border-indigo-400 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.25)]`.
- Watermark logo: bump opacity from 0.3 → 0.5 and invert to white (`brightness-0 invert`) so it shows on dark.

## Out of scope

- Data Inputs (stays neutral white — intentional contrast).
- Core card itself.
- Connector lines (already indigo, will flow naturally into blue pills).
- "Powered by Ventus" subline.
