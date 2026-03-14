

# Cinematic Conference Opener — Light Theme

## Summary

Same 6-beat keynote structure as the approved plan, but using the site's established light theme: white/light gray backgrounds, dark text (#0F172A), and VentusAI brand blue (#3B82F6) for intelligence accents. Matches the `/demo` page's existing light aesthetic.

## Design Adjustments from Approved Plan

- **Background**: White (`#FAFBFC`) with subtle light gray ambient gradient animation instead of near-black
- **Text**: Dark slate (`#0F172A`) for headlines, medium gray (`#64748B`) for body/subtext
- **Accent color**: Brand blue (`#3B82F6`) unchanged — used for pattern lines, intelligence labels, offers
- **Dimmed beats**: Opacity 0.15 (lighter background needs lower opacity to dim effectively)
- **Layer visuals**: Light borders (`#E2E8F0`), subtle blue-tinted shadows instead of glows
- **Password input**: White input with light border, consistent with existing `DemoPasswordGate` styling
- **VentusAI logo**: Use `ventus-logo-blue.png` (dark logo for light background)
- **Dot navigation**: Gray dots, active dot in brand blue
- **Ambient animation**: Slow-moving soft blue/gray radial gradient shift (very subtle)

## 6 Beats — Unchanged Structure

Same content and interaction model as approved plan. Click/Space/ArrowRight advances. Beats stack and dim. Beat 6 has password input (`"2026demo"`).

## File

| File | Action |
|---|---|
| `src/components/demo/DemoPasswordGate.tsx` | **Rewrite** — 6-beat light-themed keynote opener |

No other files change. Component signature stays identical.

