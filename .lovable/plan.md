# Replace partner wordmarks with uploaded logos

## Goal
Use the uploaded Finovate, Fintech Sandbox, OneValley, and Plug and Play logos in the Partners section instead of plain text.

## Assets
The four uploaded images are at:
- `user-uploads://image-5.png` — Finovate
- `user-uploads://image-6.png` — Fintech Sandbox
- `user-uploads://image-7.png` — OneValley
- `user-uploads://image-8.png` — Plug and Play

## Implementation
1. Create `src/assets/partners/` directory.
2. Upload each image to Lovable CDN with `lovable-assets create`, writing the output to `.asset.json` pointer files:
   - `src/assets/partners/finovate.png.asset.json`
   - `src/assets/partners/fintech-sandbox.png.asset.json`
   - `src/assets/partners/onevalley.png.asset.json`
   - `src/assets/partners/plug-and-play.png.asset.json`
3. Update `src/components/PartnersSection.tsx`:
   - Import the four asset pointers.
   - Replace the centered text spans with `<img>` tags using each asset's `url`.
   - Keep the four-column responsive layout and hover border.
   - Apply consistent `object-contain` sizing and alt text for accessibility.

## Verification
- Run `bun run build` after the edits.
- Take a Playwright screenshot of the Partners section to confirm all four logos render cleanly.
