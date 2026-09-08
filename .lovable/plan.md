# Update Floating Nav Menu Order

## Goal
Reorder and trim the homepage floating navigation so it reflects the new page structure: Intelligence → Personalization → Insights, then a divider, then FAQ. Remove Governance and Integration from the nav.

## Proposed Changes

### 1. Update `src/components/Navbar.tsx`
Change the link arrays and divider placement:

- **Section links (scroll-to anchors on `/`)**: 
  - Intelligence
  - Personalization
- **Page links (route links)**:
  - Insights
  - FAQ

Move the vertical divider so it appears **after Insights** and before FAQ.

Final desktop/mobile menu order: **Intelligence | Personalization | Insights | divider | FAQ**

### 2. Keep behavior intact
- Smooth-scroll to anchors when already on `/`; navigate to `/` first when on another page.
- Mobile menu styling and close behavior remain unchanged.
- "Schedule Demo" CTA stays in place.

## Outcome
The floating nav matches the simplified homepage flow and places the divider between Insights and FAQ as requested.
