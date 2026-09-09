# Announcement Bar for Upcoming Conferences

## Goal
Add a dismissible conference-announcement bar to the public website that sits above the floating navbar and links to the `/contact` page.

## Copy
"Meet the Ventus team at Finovate Fall, MoneyLIVE, and Boston Fintech Week — schedule a meeting."

## Placement
- Render at the very top of the viewport, above the existing fixed floating navbar.
- Push the navbar down by the height of the bar so it remains visually attached below it.

## Behavior
- Dismissible via a close icon (×).
- Once dismissed, stay hidden for the rest of the browser session using `sessionStorage`.
- Clicking the CTA navigates to `/contact`.
- Bar is responsive: single-line on desktop, wraps gracefully on mobile.

## Visual treatment
- Brand blue background (`bg-blue-600`) with white text.
- Small container width, centered content, close icon on the right.
- No animation on first load beyond a simple fade/slide-in; keep it lightweight.
- Respect reduced-motion preferences.

## Files to change
1. **New component**: `src/components/AnnouncementBar.tsx` — the bar UI + dismiss logic.
2. **Layout integration**: `src/App.tsx` (or the root layout that renders `<Navbar />`) — insert `<AnnouncementBar />` above `<Navbar />` and adjust navbar top offset.

## Acceptance criteria
- Bar appears on first page load above the navbar.
- Close button hides the bar and it does not reappear on refresh in the same session.
- "Schedule a meeting" text links to `/contact`.
- Navbar remains usable and visually aligned below the bar.
- No layout breakage on mobile or desktop.
