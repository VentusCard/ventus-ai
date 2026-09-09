# Footer + integration map cleanup

## Goal
Make the footer match the current site navigation, and remove the AI Coworker link from the homepage integration map.

## Changes

### 1. Footer links
Replace the current "Learn" column links (Platform, Transaction Enrichment) with links that match the nav and only point at things that exist on the landing page or in the nav:

- Sections (smooth scroll to the section on the landing page, navigate home first if on another page):
  - Intelligence
  - Personalization
  - Integration
  - Governance
- Pages: Insights, FAQ
- Company column stays: About, Schedule Demo, Contact Us button

Section links use the same scroll behavior as the top navigation so clicking from any page returns to the landing page and scrolls to the right section.

### 2. Integration map
In the homepage integration graph, the "AI Coworker" destination keeps its tile but loses its link to the AI Coworker page — it becomes a plain, non-clickable tile like the other destinations.

## Technical notes
- Footer: `src/components/Footer.tsx` — add `useNavigate`/`useLocation` scroll handler mirroring `Navbar.tsx`'s `goToSection`, targeting ids `intelligence`, `personalization`, `integration`, `governance`.
- Integration: `src/components/IntegrationSection.tsx` line 76 — drop `href: "/coworker"` from the AI Coworker tile; the existing `tile.href` conditional already renders a non-linked tile.
