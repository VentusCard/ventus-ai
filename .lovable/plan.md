## Problem
When a `SourceGroupCard` (left column) or signal/team button (core) is selected, the combined `scale-[1.01–1.02]`, `ring-2`, and thicker border expand the element slightly beyond its bounding box. The parent grid has `overflow-hidden`, so the expanded card/ring gets clipped.

## Fix
1. **Sources column** (`<div className="flex min-w-0 flex-col gap-2 justify-around">` on line ~782): add horizontal padding (`px-1` or `px-2`) so the selected card and its ring stay inside the column bounds.
2. **Core signal buttons** (inside `<div className="... p-2 -m-1">` on line ~817): the negative margin (`-m-1`) already fights the padding, but `scale-[1.02]` on the active button can still clip. Add `px-1` (or increase the existing `p-2` to `p-2.5` and keep `-m-1`) to give the scaled buttons enough room.
3. **Teams column** (`<div className="... p-2 -m-1">` on line ~947): same treatment as the signals column.
4. **Grid overflow** (`overflow-hidden` on line ~780): verify if it’s still needed after the padding changes; if the wire SVG connectors rely on it, keep it, but the added internal padding should prevent clipping of the cards themselves.

## Verification
- Click each of the 6 source cards on the left and confirm none are clipped.
- Click each signal button inside the core and confirm none are clipped.
- Click each team button on the right and confirm none are clipped.