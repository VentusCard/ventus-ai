
# Fix Integration Architecture Dialog Colors

## Problem
The dialog was designed with a dark color scheme (dark backgrounds, light text in the SVG), but TePilot pages use a light theme. This creates a jarring dark popup over a light UI.

## Solution
Update `src/components/technology/IntegrationArchitectureDialog.tsx` to use light-theme colors:

### Dialog container
- Change `bg-background/95 backdrop-blur-xl border-white/20` to `bg-white border-slate-200`

### SVG color changes
| Element | Current (dark) | New (light) |
|---|---|---|
| Dialog title | `text-foreground` | `text-slate-900` |
| Dialog description | `text-foreground/60` | `text-slate-500` |
| Bank Partner Database box | `fill="hsl(215 20% 20%)"` stroke dark | `fill="hsl(215 15% 95%)"` stroke slate |
| Bank DB text | `fill="hsl(0 0% 90%)"` | `fill="hsl(215 20% 25%)"` |
| Bank DB subtext | `fill="hsl(0 0% 60%)"` | `fill="hsl(215 10% 50%)"` |
| Ventus AI Hub box | Keep blue tint, lighten background | `fill="hsl(217 91% 95%)"` stroke blue |
| Hub text | Keep blue tones | Slightly darker blue for readability |
| Connection lines | Blue with low opacity on dark | Blue with moderate opacity on light |
| Existing pillar boxes | `fill="hsl(215 20% 18%)"` | `fill="hsl(215 15% 96%)"` light gray |
| Existing pillar labels | Light grays/whites | Dark slates (`hsl(215 20% 30%)`) |
| Existing pillar items | `fill="hsl(0 0% 60%)"` | `fill="hsl(215 10% 45%)"` |
| Ventus pillar boxes | Dark blue tint | Light blue tint `hsl(217 91% 96%)` |
| Ventus pillar items | `fill="hsl(217 80% 70%)"` | `fill="hsl(217 70% 45%)"` |
| Pair grouping bracket | Dark strokes | Light slate strokes |
| Customers box | Same as Bank DB -- dark | Light gray like Bank DB |
| Footer tagline | Low-opacity blue | Medium-opacity blue |
| Arrow markers | Blue on dark | Darker blue for contrast |

### File changed
- `src/components/technology/IntegrationArchitectureDialog.tsx` -- update all hardcoded HSL color values to light-theme equivalents
