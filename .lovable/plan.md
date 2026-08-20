# Home Page Event Announcement

Add a prominent, dismissible event-announcement banner to the home page that highlights Ventus AI's presence at three upcoming fintech conferences and drives users to the contact page.

## Scope
- Modify `src/pages/Index.tsx` only.
- No backend or route changes required (`/contact` already exists).

## Design
- Insert a full-width announcement strip at the top of `<main>`, above the existing hero.
- Use the existing light-theme palette: white background, blue-600 accents, slate text.
- Keep the style consistent with the site's enterprise aesthetic (clean, minimal, no gradients).

## Content
- Headline: "See Ventus AI live this fall"
- Body: "Meet the team at Finovate Fall, Boston Fintech Week, and MoneyLIVE 2026."
- CTA: "Contact us to schedule a meeting" linking to `/contact`.

## Interactions
- Banner is dismissible with a close button (×).
- Dismissed state persists for the session using `sessionStorage` so it does not reappear on every navigation back to `/`.
- Banner is keyboard-accessible and uses existing `lucide-react` icon for the close action.

## Acceptance
- Banner renders on `/` above the hero.
- Link navigates to `/contact`.
- Close button hides the banner for the current session.
- No visual regressions on mobile or desktop.
