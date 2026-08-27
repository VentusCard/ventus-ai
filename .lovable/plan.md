# Nest Data Sources into Internal / External Wrappers

## Goal
In `/bankdemo` System tab → Data sources column, turn the flat "Internal signals" and "External signals" section headers into visually distinct, nested containers that each wrap their two source cards.

## What will change
- Replace the current flat list in `CapabilitiesView.tsx` (`sourceSections.map(...)` inside the Data sources column) with two rounded wrapper panels:
  - **Internal signals** — soft sky tint (`bg-sky-50/40`, `border-sky-100`) containing *Banking Core* and *Digital Banking*.
  - **External signals** — soft amber tint (`bg-amber-50/40`, `border-amber-100`) containing *External Intelligence 1* and *External Intelligence 2*.
- Each wrapper gets a small header pill/badge showing the group name and source count, so the grouping is obvious at a glance.
- Restyle `SourceGroupCard` so the cards sit cleanly inside the wrapper:
  - Keep the icon, provider name, sublabel, and a single status pill.
  - Remove the duplicated "2 source feeds" / "Internal" or "External · Modeled" pill pair to reduce visual noise (the wrapper now communicates that).
  - Keep the active-selection ring (`border-sky-300 ring-1 ring-sky-200`).
- Fix the FCRA/non-FCRA detail-panel check so it works for both external provider names (`External Intelligence 1` and `External Intelligence 2`) instead of the old non-matching string.
- Keep the overall pipeline board layout intact (sources → connector → core → connector → destinations).

## Files to edit
- `src/components/tepilot/insights/CapabilitiesView.tsx`

## Validation
- Type check (`tsgo` or `bunx tsc --noEmit`) and build (`build-errors.log`) must pass.
- Visual check: Data sources column shows two tinted nested groups; source cards are clickable and still drive the shared detail panel below.
