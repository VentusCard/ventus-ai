# Connect Personalized Banking to the Ventus Core

Scope: `src/components/tepilot/insights/CapabilitiesView.tsx` only. Strict light theme preserved; left "Data Inputs" column stays neutral so the visual lineage flows core → downstream.

## 1. Recolor the downstream pills (Ventus signature)

Update the `Pill` component so each Personalized Banking card reads as part of the Ventus system:

- Card: white background, `border-indigo-200` (instead of `border-slate-200`), `border-l-2 border-l-indigo-600` accent stripe on the left edge.
- Icon chip: swap `bg-slate-100` / `text-slate-600` for a soft gradient `bg-gradient-to-br from-blue-900 to-indigo-900` with white icon — matching the core's gradient exactly.
- Hover: `hover:border-indigo-400 hover:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]`.
- Tiny Ventus mark: small `ventusLogoTransparent` (h-3, opacity-60, indigo tint via `brightness-0` + indigo filter, or just the existing logo at low opacity) in the top-right corner of each pill.

## 2. Replace the right brace with animated connector lines

Remove the right `<Brace direction="left" />` and the plain column-grid layout in that area. Replace with a dedicated SVG connector that fans from the core's right edge to each of the 6 downstream pills:

- New `<CoreConnectors />` SVG component, absolutely positioned in the gap column, `preserveAspectRatio="none"`, spanning full height.
- 6 thin paths (`stroke-width="1.5"`), each a smooth cubic curve from a single anchor on the left (core side) to evenly spaced anchors on the right (one per pill row).
- Stroke: `url(#ventusFlow)` — a linear gradient `from-indigo-200 via-indigo-500 to-indigo-300`.
- Subtle pulse animation: each path gets `stroke-dasharray="4 8"` plus a CSS keyframe animating `stroke-dashoffset` from 0 → -24 over ~3s linear infinite. Stagger `animation-delay` per line (0s, 0.4s, 0.8s, …) so the flow looks organic, not synchronized.
- Add the keyframe locally via a `<style>` tag in the component (scoped class name `ventus-flow`) to avoid touching `tailwind.config.ts`.

## 3. Header treatment

Under the "PERSONALIZED BANKING" header, add a second line:

- `<p className="text-[10px] font-medium text-indigo-600 text-center -mt-2 mb-3">Powered by Ventus</p>`
- Small indigo dot (`w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse`) preceding the text inline.

## 4. Left column stays neutral (intentional contrast)

No changes to Data Inputs styling or the left brace — keeps the narrative "raw data in (neutral) → Ventus transforms → personalized output (indigo / branded)".

## Technical notes

- File touched: `src/components/tepilot/insights/CapabilitiesView.tsx` only.
- New local subcomponent `CoreConnectors` rendered inside the existing grid; the right gap column changes from `auto` to a fixed width (e.g. `w-16`) so the SVG has room.
- Pulse animation is pure CSS in a scoped `<style>` block — no Tailwind config edits, no new dependencies.
- All colors via Tailwind's indigo/blue palette already used by the core (`from-blue-900 to-indigo-900`, `indigo-200/400/600`) — no new design tokens.
- Light theme preserved; no `dark:` utilities.

## Out of scope

- Data Inputs column styling.
- Core card itself (already branded).
- Any copy changes beyond the new "Powered by Ventus" subline.
