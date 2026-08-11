Replace the "VENTUS AI" sidebar group header text with a white Ventus AI logo.

## What will change

1. **New logo asset** — Generate a white "VENTUS AI" wordmark (bold sans-serif, matching the existing brand style) with a transparent background so it reads cleanly on the dark blue sidebar.
2. **Sidebar header** — In `src/components/tepilot/insights/AnalyticsContainer.tsx`, update the special `isHome` rendering block (currently the "VENTUS AI" text label) to display the new white logo image instead of plain text. Keep the same layout spacing and section divider below it.
3. **Asset handling** — Upload the generated image as a Lovable asset and reference it from the component via the `.asset.json` URL, or add it to `src/assets` and import it directly if the project is still using local asset imports.

## Out of scope

- No changes to other sidebar groups, navigation items, or tab behavior.
- No changes to the "Our Bank" brand header at the top of the sidebar.
