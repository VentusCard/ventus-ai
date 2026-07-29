## Add Coworker to Solutions Dropdown

### Goal
Add a navigation entry for the new `/coworker` page inside the main site navbar’s **Solutions** dropdown, grouped with the existing bank-facing analytics offering.

### Current state
`src/components/Navbar.tsx` renders a Solutions dropdown with two sections:
- **BEHAVIORAL INTELLIGENCE**: Next Offer, Next Product, Next Conversation
- **ANALYTICS**: Customer Intelligence

The `/coworker` route exists in `src/App.tsx` and the page is built.

### Changes
1. **Rename the Analytics section header** to signal that both items are bank-facing, e.g. **BANK-FACING INTELLIGENCE**.

2. **Desktop dropdown**
   - Keep Customer Intelligence in the renamed section.
   - Add a second item: **Ventus AI Coworker** → `/coworker`.
   - Use a Lucide icon that fits an AI-assistant concept (e.g. `Bot` or `Sparkles`).
   - Keep the existing hover/click behavior and styling consistent with the other items.

3. **Mobile menu**
   - Mirror the same renamed section and the two items under the Solutions expander so mobile users can also reach `/coworker`.

### Files to modify
- `src/components/Navbar.tsx` only.

### Acceptance
- Hovering Solutions on desktop shows the renamed bank-facing section with Customer Intelligence and Ventus AI Coworker.
- Tapping Solutions on mobile expands to show the same two items.
- Clicking Ventus AI Coworker navigates to `/coworker` and closes the menu.