## Plan: Horizontal Solutions Dropdown

### Goal
Restructure the desktop Solutions mega-menu so the two intelligence sections sit side-by-side instead of stacked vertically, making better use of dropdown width and visually grouping the two bank-facing items.

### Changes
1. **File:** `src/components/Navbar.tsx`
2. **Desktop dropdown container:**
   - Replace single `w-80` column with a wider container (e.g., `w-[640px]` or `w-[680px]`).
   - Use a flex/grid layout (`grid-cols-2`) so `behavioralIntelligenceItems` and `analyticsItems` each occupy one column.
   - Keep each column's existing item styling (icon, title, description).
   - Move the section labels (`BEHAVIORAL INTELLIGENCE`, `BANK-FACING INTELLIGENCE`) above each respective column.
   - Remove the horizontal divider between sections on desktop (no longer needed with side-by-side columns).
3. **Mobile behavior:**
   - Preserve the existing vertical stacked layout inside the mobile menu; do not change the mobile structure.
4. **Visual polish:**
   - Add a subtle vertical divider between the two columns if needed for separation.
   - Ensure hover states and click handlers remain intact.
   - Keep the dropdown positioned correctly under the Solutions trigger.

### Verification
- Open the preview and hover over Solutions on desktop.
- Confirm both columns are visible, equal height, and items are clickable.
- Confirm mobile menu still stacks vertically.
- Run typecheck/build to ensure no TS errors.