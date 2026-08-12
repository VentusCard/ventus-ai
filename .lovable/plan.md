# Align source and destination columns to the Ventus core height

On the /bankdemo System tab pipeline board, the left (Data sources) and right (Activation destinations) columns currently size to their content, so they end short of the dark Ventus core card. Make both columns fill the full board height so all three panes end on the same line, matching the reference.

## What changes

- Both side columns become full-height flex columns (`flex h-full flex-col`), with the row list taking the remaining space (`flex-1`).
- Source rows stretch evenly (`flex-1` with a `min-h-[52px]` floor) so the 5 source rows distribute across the core's height.
- Destination rows keep their `flex-1 min-h-[34px]` stretch, so the 9 rows fill the same height.
- No content, ordering, styling, or click behavior changes — only sizing.

## Technical notes

- Single file: `src/components/tepilot/insights/CapabilitiesView.tsx`: the sources column wrapper, the destinations column wrapper, and `SourceGroupCard`'s root button classes.
- The grid already uses `items-stretch`, so the columns inherit the tallest track (the core) once they are `h-full`.

## Verification

Load /bankdemo → System tab and confirm the three panes are flush at the bottom at desktop width.
