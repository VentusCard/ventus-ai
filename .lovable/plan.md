# Add vertical buffer around data-source taglines

## Goal
Increase the whitespace above and below the "Rail-agnostic transaction enrichment" and "Source-agnostic behavioral intelligence" taglines in the `/bankdemo` System tab so the section uses its vertical space more cleanly and the taglines read as distinct section anchors.

## Current state
In `src/components/tepilot/insights/CapabilitiesView.tsx`, each data-source wrapper (`sourceSections` map) is a flex column with `gap-2.5` and `p-3`. The tagline is rendered as a bold 14px paragraph immediately under the header pill, with no explicit vertical padding. The source cards sit directly beneath it, making the tagline feel cramped.

## Changes
1. In the `sourceSections.map` render block, add explicit top and bottom padding to the tagline paragraph (e.g., `py-2` or `py-2.5`) so it sits in its own whitespace band.
2. Slightly increase the wrapper column gap from `gap-2.5` to `gap-3` so the header, tagline, and source-card group breathe as three separate bands.
3. Keep the existing grey color scheme (slate for Internal, zinc for External), border, and font styling untouched.

## Verification
- Build/type-check passes.
- Visual check of the System tab Data sources column confirms the taglines are no longer touching the header pill or the first source card.
