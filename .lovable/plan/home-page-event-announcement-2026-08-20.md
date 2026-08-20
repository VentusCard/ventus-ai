# Home Page Event Announcement

Add a prominent, dismissible event-announcement banner to the home page that highlights Ventus AI's presence at three upcoming fintech conferences and drives users to the contact page.

## Scope
- Modify the shared layout so the announcement appears above the navigation menu on the home page (and any other pages that share the same layout).
- No backend or route changes required (`/contact` already exists).

## Design
- Add a thin, full-width "sliver" announcement bar directly above the `Navbar`.
- Use the existing light-theme palette: subtle background tint (e.g., `bg-blue-50`), blue-600 text/accents, slate text.
- Keep height compact (~36–40 px) so it reads as a sliver, not a banner.
- Center the text; on mobile, allow wrapping or truncate gracefully.

## Content
- Single line: "See Ventus AI live this fall at Finovate Fall, Boston Fintech Week, and MoneyLIVE 2026."
- Inline link: "Contact us →" linking to `/contact`.

## Interactions
- Bar is dismissible with a small close button (×) on the right.
- Dismissed state persists for the session using `sessionStorage` so it does not reappear on every navigation.
- Bar is keyboard-accessible and uses an existing `lucide-react` icon for the close action.
- The `Navbar` shifts down when the bar is visible and returns to the top when dismissed.

## Acceptance
- Banner renders on `/` above the hero.
- Link navigates to `/contact`.
- Close button hides the banner for the current session.
- No visual regressions on mobile or desktop.
