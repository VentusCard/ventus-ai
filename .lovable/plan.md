Update the `/bankdemo` password gate (`SimplePasswordGate.tsx`) to add three expandable content sections above the password input.

**Assumption:** Clicking any section header expands all three sections simultaneously. If accordion-style (one-at-a-time) is preferred, reject this plan and I'll adjust.

### Changes

**1. Insert three sections between the optional bullets and the password form**
- **Our Mission**
- **Our Team**  
- **Our Vision**

Use the exact copy provided by the user for each section's expanded content.

**2. Default state ("sliver")**
- Show only the three section titles as clickable headers in a compact, vertical stack.
- No body text visible.

**3. Expanded state**
- Clicking any header expands **all three** sections at once, revealing their full paragraphs.
- Clicking any header again collapses all three back to the sliver view.
- Smooth CSS height/opacity transition for expand/collapse.

**4. Styling**
- Strict light theme: white backgrounds, `slate-200` borders.
- Font: `Manrope` (consistent with the gate page).
- Clean hover/focus states on headers.
- No dark-mode utilities.

**5. Layout preservation**
- Keep the existing logo, tagline, optional bullets, and password form in their current order.
- Ensure responsive centered layout is maintained.

### No other files affected