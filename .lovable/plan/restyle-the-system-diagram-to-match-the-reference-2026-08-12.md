# Restyle the System diagram to match the reference

The KPI strip, page header, and lower tables of the System tab already follow the reference design. The pipeline diagram in the middle still uses the old look: wide gap columns, curved SVG wires across the canvas, a glowing blue/indigo core with heavy shadows, and pill-style signal buttons.

This change makes the diagram itself match the same visual language, without changing any content or click behavior.

## What changes visually

Layout
- Replace the three wide columns plus floating wire canvas with the reference's five-track board: `sources | connector | core | connector | destinations`, wrapped in one thin white board (`rounded-2xl border-slate-200`, small inner padding).
- Remove the separate column-header row; each side column gets its own small mono header inline ("Data sources · 6 groups · 39", "Activation destinations · 6").
- Between columns, use the reference's simple arrow connector (short horizontal line + arrowhead, muted; amber tint on the output side) instead of the full-width curved wire canvas.

Source and destination rows
- Flatten to the reference row style: `rounded-[10px] border-slate-100`, 30x30 tinted icon tile (sky for internal, amber for external/modeled, violet for destinations), 13px name, 11px mono meta line, right-side status chip (green dot for sources, "Live" chip for destinations).
- Keep the existing selection/click behavior; the active state becomes a subtle ring instead of a scale/glow.

Intelligence core
- Retune to the reference dark card: `bg-gradient-to-b from-[#0E1626] to-[#131E31]`, `rounded-xl`, no outer glow or colored border.
- Header: small mark + title on one line, muted 11.5px description under it.
- Signals: reference-style stacked rows on `bg-white/[0.045]` with `border-white/[0.08]`, under a mono `SIGNALS · WHAT WE DETECT` label. Keep the inner bus SVG only if it still reads clean at the tighter width; otherwise drop it in favor of the flat stacked list.

Typography and color
- All numbers and metadata switch to mono/tabular; all section labels to `text-[10.5px] uppercase tracking-wider text-slate-400`.
- Status colors align with the rest of the tab: emerald = live, sky = first-party, amber = modeled, violet = activation.

## Scope

- File: `src/components/tepilot/insights/CapabilitiesView.tsx` (pipeline board section and its `SourceGroupCard` / destination row / `NetworkWires` helpers).
- Presentation only — no data, taxonomy, or navigation changes. Source click → filter, signal click → highlight, and destination click-through all keep working.
- Verified afterwards with a Playwright screenshot of `/bankdemo` → System tab.
