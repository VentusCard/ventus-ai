# Remove Cal.com branding from booking card

## Goal
Hide the Cal.com footer/branding bar that appears at the bottom of the embedded calendar inside the `/contact` booking card, without breaking the calendar or time-slot selection.

## Approach
1. Inspect the rendered Cal.com embed to confirm which bottom element is the branding/footer.
2. Try Cal.com embed configuration first: pass `hideEventTypeDetails: true` or branding-related flags if the API supports them.
3. If the embed API does not expose a clean hide option, mask the bottom branding strip with CSS: wrap the embed in an `overflow-hidden` container, set the inner iframe height slightly taller than the wrapper, and pull it up so the bottom strip is clipped out of view.
4. Adjust the wrapper height so the calendar and available time slots remain fully visible and usable.

## Files to edit
- `src/pages/ContactUs.tsx` — update `CalEmbed` wrapper and booking card styles.

## Verification
- Run `bun run build`.
- Use Playwright to open `/contact`, click "Book Meeting", and capture the booking card to confirm the bottom Cal.com section is gone and the calendar/time slots are still readable.
