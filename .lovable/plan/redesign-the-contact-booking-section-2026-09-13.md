# Redesign the /contact booking section

## Goal
Replace the current full-width Cal.com week-view booking area (heavy gray unavailable-time grid on the right) with a cleaner, contained month-view card that matches the rest of the public site.

## Selected direction
**Minimalist month layout** — a centered, white bordered card with a light month calendar on the left and available time slots on the right, rounded corners, soft shadow, and minimal intro text above.

## What will change
- Only the booking section on `/contact` (between the hero and the email form).
- The Cal.com embed will switch from `layout: "week_view"` to `layout: "month_view"` with `theme: "light"`.
- The embed will be wrapped in a centered `max-w-4xl` card using the existing white/slate palette (`bg-white`, `border-slate-200`, `rounded-2xl`, `shadow-sm`).
- The card will be sized so the calendar and slot list render without clipping and without a giant empty gray grid.

## What will not change
- Hero text, the two scroll buttons, and smooth-scroll behavior.
- The email contact form below the booking section.
- The Cal.com namespace (`30min`) and `calLink` (`ventusai/30min`).
- No dark-mode utilities; strict light theme is preserved.

## Implementation steps
1. Open `src/pages/ContactUs.tsx`.
2. Update the Cal.com embed config: set `layout: "month_view"` and `theme: "light"`.
3. Wrap the embed in a centered card container:
   - `max-w-4xl mx-auto`
   - `bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden`
   - responsive height that fits the month view (avoid the previous clipped/tall week grid).
4. Add a short centered heading + subline directly above the card: "Book a Meeting" / "Select a time for our 30-minute discovery call."
5. Keep the existing `bookRef` target and scroll behavior.
6. Run `bun run build` and a Playwright check on `/contact` to confirm the card renders cleanly and the form still works.
