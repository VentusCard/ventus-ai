# Fix Cal.com Embed Sizing and Light Theme

## Goal
Make the Cal.com embed smaller and ensure it actually renders in light mode.

## Changes

1. **Reduce embed size**
   - Lower the iframe `minHeight` from `680px` to `560px`.
   - Add `layout=week_view` to the Cal.com URL so the calendar starts in the compact weekly view instead of the taller monthly view.

2. **Force light theme correctly**
   - Keep `theme=light` as the first query parameter.
   - If Cal.com still renders dark, wrap the embed attempt with the official Cal.com light-theme embed attributes via `data-cal-link` + `data-theme="light"` as a fallback, or add `brandColor` to align with the site's blue.

3. **Light container guard**
   - Keep the surrounding card as white with a slate-200 border so the area around the iframe matches the page even during load.

4. **Verify**
   - Run `bun run build` to confirm no errors.

## Files touched
- `src/pages/ContactUs.tsx`

## Technical note
Cal.com iframe URLs accept `theme=light` and `layout=week_view` as query parameters. Week view is shorter than month view and better fits a side-by-side contact layout.
