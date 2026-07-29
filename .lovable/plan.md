Update the "Segmented email · draft" card in `src/components/solutions/CampaignStudioPreview.tsx` to be the visual anchor of the Campaign Studio preview, following the selected "Prominent campaign card" direction.

What will change:
- Increase the card's internal padding and typographic scale so it no longer feels like a secondary row beneath the segment grid.
- Restructure the header into a clear title block with a mail icon, a "Draft" status badge, and the reachable-audience count.
- Add a subtle progress/status bar at the bottom of the card to reinforce that this is the generated artifact.
- Enlarge the subject line and body copy for readability and hierarchy.
- Keep the existing segment tabs, product band, rotation behavior, and merge-token placeholders untouched.

Technical notes:
- Modify only `CampaignStudioPreview.tsx`; no new dependencies.
- Use existing Tailwind utilities and the light-theme palette already in use (white card, gray-200 border, blue-50/blue-600 accents, amber-50/amber-700 draft badge).
- Preserve the `key={active.id}` animation behavior and the `MergeToken` component.
- Maintain the current segment-driven dynamic content (subject, body, valueMath, categories, channels).