## Replace the 25-line fan with a clean "manifold bus" connector

The current connector draws 5×5 = 25 animated dashed curves between signals and applications. At the narrow 28px column width this collapses into visual noise, with overlapping curves that read as a smudge rather than a relationship.

### New design: converging bus + active highlight

```text
 Signal ──╮
 Signal ──┤
 Signal ──┼──● ──┬── App
 Signal ──┤      ├── App
 Signal ──╯      ├── App
                 ├── App
                 └── App
```

- **Left side**: each signal row emits a short horizontal stub that curves into a single vertical "bus bar" sitting in the middle of the 28px gutter.
- **Center hub**: a small glowing node on the bus (subtle pulse) signals "all signals merge here".
- **Right side**: the bus fans out, one short curve per application row, into each app card.
- Total strokes drop from 25 to 10 (5 in + 5 out), all non-overlapping.

### Interaction

- **Idle**: thin indigo→violet gradient strokes, gentle flow animation along the bus only (not on every line).
- **Signal active**: that signal's inbound stub brightens to white, the bus segment glows, and all 5 outbound stubs brighten — communicating "this signal feeds every application".
- **Application active**: that app's outbound stub plus all 5 inbound stubs brighten — communicating "this application uses every signal".
- **Idle hover**: light brighten on the hovered stub only.

### Visual treatment

- Stroke: `vectorEffect="non-scaling-stroke"`, 1px idle / 1.75px active.
- Gradient: `rgba(165,180,252,0.35)` → `rgba(196,181,253,0.35)` idle; `rgba(255,255,255,0.95)` active.
- Bus bar: 1.5px vertical line with a 6px soft glow filter; center node is a 4px circle with `animate-pulse`.
- Animation: replace the 25 staggered `stroke-dashoffset` loops with a single subtle dash flow on the bus bar (2.4s loop). Stubs are static unless active.
- Remove the heavy `strokeDasharray="1.2 1.6"` — solid strokes read cleaner at this scale.

### Implementation

Single file edit: `src/components/tepilot/insights/CapabilitiesView.tsx`, lines ~662–705 (the fan-line `<svg>` block).

- Widen the gutter column from `28px` to `48px` so the bus + stubs have room to breathe.
- Rewrite the SVG: 5 inbound paths `M 0 y → C 30 y, 30 50, 50 50` style stubs to the bus, vertical bus line `x=50 y=8→92`, center hub circle, 5 outbound paths mirrored to the right.
- Drive active state from existing `activeSignalLabel` / `activeApplicationLabel` — no new state needed.
- Keep all signal/application button markup and the rest of the Core card unchanged.

No other files touched.