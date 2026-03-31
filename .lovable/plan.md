

## Remove Only the Impact Column from Demo Network Diagram

### What changes (all in `src/components/demo/DemoNetworkDiagram.tsx`)

1. **Delete `IMPACT_METRICS` constant** (lines 95-99) and `visibleImpactMetrics` memo (lines 107-113).

2. **Remove Impact layout variables**: delete `gap4` (line 150), `IMPACT_COL_WIDTH` (line 152), `anyImpactVisible` (line 155), `centeringShift` (line 160), `impactColLeftX` (line 166).

3. **Fix `totalContentWidth`**: remove `+ gap4 + IMPACT_COL_WIDTH` from line 157.

4. **Remove `centeringShift` from wrapper transform** (line 186) — just remove the `translateX` or set it to `0`.

5. **Delete Consumer→Impact SVG connector lines** (lines 300-318).

6. **Delete Impact column rendering** (lines 484-524).

7. **Delete Impact column header** (lines 551-556).

8. **Remove `ArrowUpRight` from lucide imports** (if only used by Impact).

### What stays untouched
- All animations (moving dots, transitions, hover effects)
- All other columns, nodes, click handlers, layout

