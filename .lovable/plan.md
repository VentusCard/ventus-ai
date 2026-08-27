Make Data Source Section Taglines Bigger and Bolder

Current state
- In /bankdemo → Systems tab → Intelligence pipeline → Data sources column, each section ("Internal signals", "External signals") has a small tagline rendered as 12px muted slate text.
- The taglines are: "Rail-agnostic transaction enrichment" and "Source-agnostic behavioral intelligence".

Goal
- Make the taglines visually prominent with a simpler, cleaner treatment: larger and bolder text, no card wrapper.

Plan
1. In `src/components/tepilot/insights/CapabilitiesView.tsx`, update the tagline rendering inside the `sourceSections` map.
2. Remove the card wrapper, left border accent, icon, and shadow.
3. Render the tagline as plain text directly under the section header.
4. Increase font size to `text-[14px]` or `text-sm` and font weight to `font-bold` or `font-extrabold`.
5. Use the section's theme color for the text: `text-sky-700` for Internal signals and `text-amber-700` for External signals.
6. Keep the existing two-group wrapper layout and source cards unchanged.
7. Verify the result with a Playwright screenshot of the Systems tab data sources column.
