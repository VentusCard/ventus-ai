## Visually differentiate Signals vs Applications inside the Ventus Core card

Right now both inner bands use the same chip style on the same dark gradient, so the eye can't tell "what we detect" from "what we do with it". The fix is to give each band its own role-based treatment while keeping them inside one Core card.

### Direction: "Inputs band" vs "Outputs band"

Treat the left band as raw intelligence (cool, quiet, indigo) and the right band as activated actions (warm, bright, amber/white) — same language Ventus uses elsewhere (sources are indigo, destinations are warm).

Changes in `CapabilitiesView.tsx` only, inside the Core card:

1. **Two-tone background inside the Core card**
   - Left half: subtle indigo wash (`bg-gradient-to-b from-indigo-950/40 to-transparent`) with a faint inner border on the right edge.
   - Right half: subtle amber/white wash (`bg-gradient-to-b from-amber-500/10 to-transparent`).
   - A thin vertical hairline (`border-l border-white/10`) runs down the 48px gutter so the bus connector sits on a real seam, not floating.

2. **Band headers**
   - Left header: small indigo dot + label `SIGNALS · what we detect` in indigo-200.
   - Right header: small amber dot + label `APPLICATIONS · what we activate` in amber-200.
   - Same 10px uppercase tracking already used elsewhere, so it reads as a sub-section, not a new card.

3. **Chip styling per band**
   - Signal chips: ghost style — `bg-white/5`, `border border-indigo-400/25`, indigo-100 text, indigo-300 icon. Reads as "data".
   - Application chips: solid style — `bg-white/10`, `border border-amber-300/40`, white text, amber-300 icon, subtle inner highlight. Reads as "product".
   - Active state keeps the existing white ring but tints to the band color so users always know which side they clicked.

4. **Connector recoloring (already in place, light touch)**
   - Inbound stubs (signals → bus): indigo gradient.
   - Outbound stubs (bus → applications): amber gradient.
   - Hub node: indigo→amber radial so it visually "translates" signals into applications.

5. **Optional micro-label on the bus**
   - A tiny vertical `→` glyph or the word `ACTIVATE` rotated 90° centered on the bus, white/40 opacity. Skippable if it feels noisy.

### Why this works
- Color does the heavy lifting (cool=sense, warm=act), so the split is legible at a glance even without reading labels.
- Both bands stay inside one Core card, preserving the "everything Ventus does lives here" story.
- Reuses the indigo/amber palette already on the page (sources are indigo, destinations are warm), so the Core card now visibly bridges them.

### Files touched
- `src/components/tepilot/insights/CapabilitiesView.tsx` (Core card interior only — no layout, grid, or connector geometry changes)
