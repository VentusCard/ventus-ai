# Decrease vertical white space on /contact

## Goal
Tighten the `/contact` page so the hero, booking card, and email form feel closer together and the booking card no longer has a large empty area below the Cal.com content.

## What will change
- Reduce vertical section padding on the hero, booking, and form sections.
- Reduce the margin between section headings and their content.
- Lower the booking card height so the Cal.com month view fills the container without a tall strip of empty white space beneath it.
- Keep all copy, buttons, scroll behavior, and form functionality unchanged.

## Specific edits in `src/pages/ContactUs.tsx`
1. Hero section: change `py-10 md:py-16` to `py-8 md:py-12`.
2. Hero heading/button group spacing: reduce `mb-8` gaps to `mb-6` where appropriate.
3. Booking section: change `py-10 md:py-16` to `py-8 md:py-12` and reduce the `mb-8` under the section heading to `mb-6`.
4. Booking card container: change `min-h-[520px] h-[600px] md:h-[640px]` to `min-h-[480px] h-[520px] md:h-[560px]`.
5. Form section: change `py-10 md:py-16` to `py-8 md:py-12` and reduce the `mb-8` under the section heading to `mb-6`.

## Verification
- Run `bun run build`.
- Use Playwright to capture `/contact` at desktop and mobile viewports, confirming the page is tighter and the Cal.com embed is not clipped.
