# Plan: Redesign /contact as a single vertical page

## Goal
Rebuild `/contact` as one vertically-scrolling page with a hero section that offers two side-by-side actions, followed by the Cal.com embed section and the email contact form section.

## What will change
- `src/pages/ContactUs.tsx`
  - **Hero section**
    - Eyebrow "Get In Touch", heading "Let's talk.", and a short subline.
    - Two buttons side by side:
      - "Book Meeting" — scrolls to the Cal.com embed section.
      - "Contact Form" — scrolls to the email form section.
  - **Book Meeting section**
    - Section heading (e.g., "Book a 30-minute meeting") and a short description.
    - Full-width Cal.com React embed in a light-themed card with a responsive height tall enough to avoid clipping (e.g., `h-[520px] md:h-[680px]`).
    - Keep `theme: "light"`, `layout: "week_view"`, `useSlotsViewOnSmallScreen: "true"`.
  - **Contact Form section**
    - Section heading "Prefer email?" and subline.
    - Existing form fields, validation, Supabase `send-contact` submission, success overlay, and toast behavior preserved.
    - Restyled to match the light theme and sit cleanly below the embed.
  - Remove the current two-column grid and the inline "What happens next" list from the hero (or relocate/repurpose as concise copy under the hero subline).
  - Use smooth scroll-to-section behavior via element refs and `scrollIntoView`.
  - Add the same `fade-in-down` entrance animation used on the homepage hero/FAQ.

## Out of scope
- No changes to the navbar, announcement bar, footer, SEO, or edge function.
- No new dependencies.

## Verification
- Run `bun run build` and confirm no errors.
- Use Playwright to visit `/contact`, confirm both buttons scroll to the correct sections, the Cal embed is full-width and fully visible, and the form submits successfully.
