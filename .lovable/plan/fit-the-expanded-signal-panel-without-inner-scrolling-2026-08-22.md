# Fit the expanded signal panel without inner scrolling

The expanded family drawer currently shows signals in a 2-column grid inside a fixed 260px box, so 6–8 signals always scroll. Rework the layout so every signal in a family fits in the drawer at once.

## Changes

**`SignalFamilyPanel.tsx`**
- Drop the fixed `h-[260px] overflow-y-auto` container; the drawer sizes to its content and stays roughly double the card-row height.
- Move the grid to a responsive density: 2 columns on small screens, 3 on `lg`, 4 on `xl`. With 6–8 signals per family this is 2 rows, no scroll.
- Tighten each signal tile so 4-up stays readable:
  - Title + confidence chip on line one (chip shrinks to a dot-sized label at 4-up width).
  - Evidence line stays single-line truncated.
  - Metrics row: count, delta, sparkline (narrower, 44px). The "Open segment" text becomes a hover-revealed arrow only, freeing horizontal room.
- Reduce padding/gaps slightly (px-2.5 py-2, gap-1.5) so two rows fit inside the drawer height.

Everything else — the slim hint bar, close button, click-to-open-segment behavior, and the always-visible 5-card row above — stays as is.
