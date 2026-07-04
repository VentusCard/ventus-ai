### Goal
When a card is clicked, its body text expands into a full-width panel below the three title buttons, without changing the button row layout.

### Current State
Each card is a single bordered box containing both the title and the expandable text. When expanded, the text grows inside that one-third-width column.

### Changes
1. **Split title buttons from body content**
   - Keep the three titles in a `md:grid-cols-3` row with fixed `h-14` height, borders, and centered text. These act as toggle buttons only.
   - Remove the expandable text from inside each card div.
2. **Add a shared full-width content panel**
   - Directly below the title row, render a single container that spans all columns.
   - When a title is selected, this panel displays that section’s text.
   - Use `max-h-0` → `max-h-[500px]` and `opacity` transitions for smooth reveal.
3. **Preserve collapsed appearance**
   - Unselected titles remain `h-14` and visually identical.
   - The selected title can show an active state (e.g., border-blue-400 or rotated chevron) but stays the same size and position.
4. **Mobile behavior**
   - Title row stacks vertically (`grid-cols-1`).
   - Full-width panel still sits below the selected title and spans the container.
5. **Styling consistency**
   - Retain border-slate-200, rounded-xl, bg-white, Manrope font, and existing transition timing.

### File
- `src/components/demo/SimplePasswordGate.tsx`

### Verification
- Build passes.
- Screenshot: collapsed state shows 3 equal short buttons in a row.
- Screenshot: clicking a button expands a full-width text panel below the entire row, while the button row itself does not shift or resize.