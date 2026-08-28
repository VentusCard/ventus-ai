# System Tab — Data Sources Column Visual Update

## Goal
Make the **Data sources** column in `/bankdemo` System tab visually cohesive with the left sidebar by giving it a dark blue border and text colors drawn from the same palette.

## Current state
- The left sidebar in `AnalyticsContainer.tsx` uses `bg-[#141432]` with `text-indigo-100/80` (inactive), `text-white` (active), and `text-indigo-100/90` (group headers).
- The data sources column in `CapabilitiesView.tsx` (lines ~1011–1069) currently uses light `slate`/`zinc` borders and text (`border-slate-200`, `text-slate-600`, etc.).

## Change
Update the data sources column wrapper and its child section cards in `src/components/tepilot/insights/CapabilitiesView.tsx`:
1. Apply a dark blue border (`border-indigo-900/60` or `border-[#141432]`) to the data sources column container.
2. Recolor all data-source text to match the left sidebar:
   - Column header → `text-indigo-100/90` or `text-white`
   - Section labels ("Internal signals", "External signals") → `text-indigo-100/90`
   - Taglines and source counts → `text-indigo-100/80`
   - Source group card labels → `text-white`
   - Source group card sublabels → `text-indigo-200/70`
3. Keep the existing background subtle (light surface) so the column still reads as a distinct pipeline stage, but ensure the border and typography tie it to the sidebar.

## Files
- `src/components/tepilot/insights/CapabilitiesView.tsx` (only the data sources column markup and `SourceGroupCard` classes)

## Verification
- Build the project and confirm no TypeScript/Tailwind errors.
- Open `/bankdemo` → System tab and visually confirm the first column has a dark blue border and its text matches the left menu tone.
