## Goal
Convert the three "Our" sections (Mission, Team, Vision) on the `/bankdemo` password gate from a single vertical accordion into independently expandable horizontal cards.

## What we're changing
File: `src/components/demo/SimplePasswordGate.tsx`

## Plan

### 1. State refactor
Replace the single `aboutExpanded` boolean with per-section expansion tracking (e.g., `expandedSection: string | null`). Clicking a section header toggles only that section; the other two stay in their current state.

### 2. Horizontal card layout
- Wrap the three sections in a responsive container: horizontal row on `md` and up (`md:grid-cols-3`), vertical stack on smaller screens.
- Each card gets a fixed minimum height in collapsed state so the title remains vertically centered.
- Use `border border-slate-200 rounded-xl bg-white` for each card; remove the current `border-b` dividers.
- Keep the container within `max-w-5xl` so it aligns with the rest of the password gate content.

### 3. Collapsed appearance
- Collapsed card: `flex items-center justify-center` with the section title centered. Keep the `ChevronDown` icon to indicate expandability.
- Set a short fixed height (e.g., `h-20` or `h-24`) for the collapsed state so all three cards align horizontally.

### 4. Expanded appearance
- Expanded card: title shifts to top-left, chevron rotates, and body text fades in below.
- Use `max-height` / opacity transitions matching the existing 500ms ease-in-out timing.
- The expanded card should grow taller to accommodate its paragraph while the sibling cards stay in their short collapsed state.

### 5. Responsive behavior
- On screens below `md`: cards stack vertically in a single column.
- In vertical/mobile mode, each card behaves the same way (centered title when collapsed, expands downward).

### 6. Visual polish
- Keep light-theme styling consistent: `slate-800` headings, `slate-600` body text, `slate-200` borders, no dark-mode utilities.
- Maintain the existing font stack (`Manrope`).

### 7. Verification
- After build, verify the password gate at `/bankdemo` shows three short horizontal cards.
- Click each card individually to confirm independent expand/collapse.
- Resize to mobile width to confirm vertical stacking.