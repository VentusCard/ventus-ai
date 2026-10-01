# Plan: Use the white Ventus AI logo for the sidebar "VENTUS AI" section label

## What changes
In `/bankdemo`, the first sidebar section label — currently the uppercase text "VENTUS AI" — is replaced by the actual Ventus AI logo, rendered in white so it reads cleanly on the dark navy sidebar.

## Details
- File: `src/components/tepilot/insights/AnalyticsContainer.tsx`, at the home group label (around line 505).
- Replace the text node with `<img src="/ventus-ai-logo.png">` (same logo file already used in the site navbar and the deckmo deck).
- Render it white with a CSS filter (`brightness-0 invert`) — no new asset needed; anti-aliased edges keep their transparency so it stays crisp on the navy background.
- Height matched to the existing label scale (about 14px), with `alt="VENTUS AI"` for accessibility and an `aria-label` so screen readers still announce the section.
- Only the expanded state changes; when the sidebar is collapsed the label is hidden today and stays hidden.
- No changes to navigation behavior, tab order, or any other section labels.

## Verification
- Playwright check on `/bankdemo`: the first sidebar section shows the white logo, logo is legible on the navy background, and clicking tabs still works.
- Build must pass with no errors.
