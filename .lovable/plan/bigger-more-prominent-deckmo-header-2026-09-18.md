# Bigger, more prominent `/deckmo` header

## Goal
Scale up everything inside the persistent header — logo, chapter title, and metadata — so it reads as a stronger presentation masthead.

## Changes (all in `src/components/deckmo/DeckmoDeck.tsx`)
- Header bar: `h-16` → `h-20` (80px).
- Ventus AI logo: `h-4` → `h-6`, divider rule scaled to match.
- Chapter title (serif, dynamic): `text-lg` → `text-2xl`, slightly stronger weight via the serif face; keep `truncate` and the `min-w-0` containment so long chapter names never collide with the logo or metadata.
- Right metadata ("Bank Leadership Presentation" / "Confidential"): `text-[10px]` → `text-xs`, keep uppercase tracking; keep divider.
- Slide sections: `pt-16` → `pt-20` so no slide content hides behind the taller bar.
- Footer and presenter view unchanged.

## Verification
- Playwright at 1428×855 and 1024×768: header shows the active chapter name at the new size, nothing clipped or overlapping, slide content unobstructed.
- Navigate a few sections (footer buttons / presenter view) to confirm the dynamic label still updates.
- No build, console, or page errors.
