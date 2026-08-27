# Add "what we do" taglines to Internal / External signal sections

## Goal

Make the Data sources column in `/bankdemo` System tab immediately explain what each signal group does, not just what feeds it.

## Changes

1. Extend the `sourceSections` model in `src/components/tepilot/insights/CapabilitiesView.tsx` to include a `tagline: string` field.
2. Set the two taglines:
  - **Internal signals**: `Rail-agnostic transaction enrichment`
  - **External signals**: `Source-agnostic behavioral intelligence`
3. Render each tagline directly under its section header pill, inside the nested wrapper, using a small, muted technical style that matches the existing light-theme density.
4. Tighten spacing so the tagline adds clarity without pushing source cards down.

## Out of scope

- No changes to source card content, FCRA logic, or the Intelligence Core / Destinations columns.
- No dark-mode or animation additions.

## Verification

- Type check passes.
- Screenshot of the System tab Data sources section confirms both taglines appear under their respective section headers and no card names are truncated more than before.