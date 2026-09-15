# Contact Page Cal.com Swap + Light Theme

## Goal
Make scheduling the primary action on the Contact page and force the Cal.com embed to use its light theme.

## Changes

1. **Swap positions**
   - Move the Cal.com inline scheduling card into the right-column spot currently occupied by the contact form.
   - Move the contact form into the lower full-width section currently occupied by the Cal.com embed.
   - Keep the left-column trust/context copy unchanged.

2. **Force Cal.com light theme**
   - Append `?theme=light` to the iframe `src` URL so Cal.com renders in light mode regardless of the visitor's system preference.

3. **Verify**
   - Run `bun run build` to confirm no type or syntax errors.

## Files touched
- `src/pages/ContactUs.tsx`

## Technical note
Cal.com supports the `theme` query parameter (`light`, `dark`, or `auto`). Using `?theme=light` locks the embed to the site's strict light aesthetic.
