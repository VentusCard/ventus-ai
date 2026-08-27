Make Data Source Section Taglines More Prominent

Current state
- In /bankdemo → Systems tab → Intelligence pipeline → Data sources column, each of the two sections ("Internal signals", "External signals") has a small tagline rendered as 12px muted slate text.
- The taglines are: "Rail-agnostic transaction enrichment" and "Source-agnostic behavioral intelligence".
- They blend in with the section and are easy to miss on a big screen.

Goal
- Increase the visual hierarchy of these taglines so they read as a clear value statement for each section without adding new content or changing the layout structure.

Plan
1. In `src/components/tepilot/insights/CapabilitiesView.tsx`, update the tagline rendering inside the `sourceSections` map.
2. Bump the font size from `text-[12px]` to `text-[13.5px]` or `text-sm`.
3. Increase color contrast: use the section's theme color (sky for internal, amber for external) instead of slate-600, e.g. `text-sky-700` / `text-amber-700`.
4. Add a subtle left border accent in the section theme color to visually tie the tagline to its group.
5. Optionally add a small theme-colored icon (e.g. `Route` for internal, `Sparkles` or `Brain` for external) to reinforce the message.
6. Keep the existing two-group wrapper layout and source cards unchanged.
7. Verify the result with a Playwright screenshot of the Systems tab data sources column.
