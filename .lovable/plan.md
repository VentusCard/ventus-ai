

# Adjust Enrichment Demo: Transparent Background, White Theme, Looping Animation

## What Changes

### 1. Transparent + White Theme (in `enrichment-demo.ts`)
Update all CSS custom properties and hardcoded colors to work on a dark/transparent background:
- `--ink` changes from dark navy to `#ffffff` (white)
- `--muted` changes to `rgba(255,255,255,.62)`
- `--hair` (borders) changes to `rgba(255,255,255,.20)`
- `--wash` changes to `rgba(255,255,255,.05)`
- `.vte-card` background changes from `rgba(255,255,255,.92)` to `transparent`
- `.vte-head` gradient uses white-based tones
- `.derived-text` color becomes `rgba(255,255,255,.80)`
- Signal chips use white-based borders/backgrounds: `--sigBg: rgba(255,255,255,.08)`, `--sigBd: rgba(255,255,255,.20)`, `--sigInk: rgba(255,255,255,.90)`
- Persona panel: `--hlBg: rgba(255,255,255,.04)`, `--hlBd: rgba(255,255,255,.16)`
- Disclaimer text becomes `rgba(255,255,255,.42)`
- Mobile `data-label` color updated to white-muted

### 2. Looping Animation (in `enrichment-demo.ts`)
Add a `<script>` block inside the HTML string that restarts the animation on a loop:
- Every ~6 seconds, remove all `data-row` animation classes and derived cell classes
- After a brief reflow, re-add them to replay the staggered row slide-in and derived column fade-in
- This creates a seamless infinite loop effect where transactions appear to be continuously enriched
- The script is self-contained within the `#ventus-te-enterprise` scope

### 3. No changes to `AnimatedDemo.tsx`
The wrapper component stays as-is -- all changes are within the demo HTML/CSS string.

## Technical Details

### Color Mapping Summary
| Element | Before | After |
|---|---|---|
| Main text (`--ink`) | `#0b1a3a` | `#ffffff` |
| Muted text | `rgba(11,26,58,.62)` | `rgba(255,255,255,.62)` |
| Borders | `rgba(11,26,58,.10)` | `rgba(255,255,255,.20)` |
| Card background | `rgba(255,255,255,.92)` | `transparent` |
| Derived text | `rgba(11,26,58,.72)` | `rgba(255,255,255,.80)` |
| Chips | green-tinted | `rgba(255,255,255,.08)` bg, `.20` border |

### Looping Script Logic
```text
setInterval (every ~6s):
  1. Reset all .data-row elements: remove animation, set opacity 0
  2. Reset all .derived cells: set opacity 0
  3. After 50ms reflow: re-apply animation classes
  4. Rows stagger in (0.1s, 0.25s, 0.4s, 0.55s, 0.7s)
  5. Derived columns fade in after 0.75s delay
  6. Visible for ~4s before next reset
```

### Files Changed
- **Modified**: `src/components/technology/demos/enrichment-demo.ts` -- theme + loop script

