# Restyle the /bankdemo System tab

Adopt the visual language of the reference design (layout + styling only). All content stays as it is today: the same sources, five signal families, teams, destinations, and click-to-expand detail behavior.

## What the tab looks like after the change

```text
┌ Page head: "System"  [● Live]        Updated 12s ago  [Refresh] [Export] ┐
├ KPI strip: 4 cards (sources · signal families · detections · destinations)
├ Section head: "Intelligence pipeline"            Configure sources →
├ Pipeline board (one rounded shell, thin inner padding)
│   Data sources | connector | dark Intelligence Core | connector | Destinations
├ Lower grid (2 cols)
│   Signal detection table            |   System health panel
└ Detail panel (existing expand-on-click content), restyled to match
```

## Layout changes

1. Replace the current `TabHeader` block on this tab with a reference-style page head: large title, animated green "Live" pill, one-line description, right-aligned timestamp plus two buttons (secondary "Refresh", dark "Export"). Buttons are presentational only.
2. Add a 4-card KPI strip above the network board, driven by values already computed in the component (total source inputs, signal families, destination count, plus one derived detection count). Cards use: label with color dot, large tabular-nums value, mono footnote, optional inline SVG sparkline.
3. Wrap the existing three-column network (sources / core / destinations) in a single `rounded-2xl border border-slate-200 bg-white p-1.5` board, with narrow connector columns between the panes and small mono uppercase column captions instead of the current header row.
4. Keep the dark core card but retune it to the reference: `rounded-xl`, `bg-gradient-to-b from-[#0E1626] to-[#131E31]`, tighter type scale, mono uppercase section label, left color-bar signal rows on `bg-white/[0.045]` with a 24h count on the right.
5. Add a lower two-column grid under the board:
   - Signal detection table (existing five signal families as rows): mono uppercase headers on `bg-slate-50/50`, color chip per row, basis badge, right-aligned tabular counts, and a thin confidence bar.
   - System health panel: green "All systems operational" banner plus a short list of source/destination status rows built from existing data.
6. Restyle the existing expanded detail panel to the same card grammar (rounded-2xl, slate-100 dividers, mono meta text) without changing what it shows.

## Style rules applied throughout

- Card shells: `rounded-2xl border-slate-200 bg-white`; inner rows `rounded-[10px] border-slate-100`.
- Numbers and metadata in mono with `tabular-nums`; labels in mono uppercase `text-[10.5px] tracking-wider text-slate-400`.
- Status colors: emerald live/health, sky first-party, amber modeled/external, violet activation.
- Strict light theme outside the dark core card; no `dark:` utilities.
- Respect `prefers-reduced-motion` for the pulsing/rolling accents.

## Technical notes

- Single file: `src/components/tepilot/insights/CapabilitiesView.tsx`. Existing constants (`SIGNALS`, `DATA_SOURCES`/source groups, `DESTINATIONS`, `NetworkWires`, selection handlers) are reused; only presentation and arrangement change.
- No new dependencies; sparklines and connectors are inline SVG.
- No routing, data, or edge-function changes.

## Verification

Load /bankdemo, open the System tab, and confirm the KPI strip, pipeline board, and lower grid render at the current viewport, and that clicking a signal, source, or team still opens the same detail content.
