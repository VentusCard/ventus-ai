# Plan: Redesign /contact scheduling layout

## Goal
Replace the broken, clipped two-column Cal.com iframe layout on `/contact` with a clean, full-width stacked layout: intro and trust steps on top, full-width Cal.com embed in the middle, and the email form below.

## What will change
- `src/pages/ContactUs.tsx`
  - Remove the side-by-side grid (trust left, calendar right).
  - Stack the page vertically:
    1. Hero intro: "Get In Touch" eyebrow, "Let's talk." heading, subtext, "What happens next" 3-step list, direct email link.
    2. Full-width Cal.com embed section in a light-themed card with enough height so the calendar is not clipped.
    3. "Prefer email?" contact form section, unchanged in fields and behavior.
- Keep the existing Cal.com React embed (`@calcom/embed-react`) with `theme: "light"`, `layout: "week_view"`, and `useSlotsViewOnSmallScreen: "true"`.
- Set the embed container to full width and a taller, responsive height (e.g., `h-[520px] md:h-[680px]`) so the week view renders fully.
- Preserve all existing form validation, Supabase `send-contact` edge-function submission, success overlay, and toast behavior.
- Keep the site-wide light theme; do not introduce dark-mode utilities.

## Out of scope
- No changes to the navbar, announcement bar, footer, SEO, or edge function.
- No new dependencies.

## Verification
- Run `bun run build` and confirm no errors.
- Use Playwright to visit `/contact`, confirm the Cal embed loads full-width, the intro text sits above it, the form sits below it, and no clipping/dark-theme bleed is visible.
