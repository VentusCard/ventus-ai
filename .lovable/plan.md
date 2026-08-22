# Larger, readable tab headers

Match every tab header to the System tab's typography while keeping the single-line layout.

## What changes

- Tab name goes from small bold (16px) to the System tab's size: 24px semibold, tight tracking.
- Description goes from 11px light grey to 14.5px medium slate-700 — the same treatment as the System tab's subtitle.
- Layout stays one row: icon, name, divider, description, with the section dropdown on the right. Description truncates on narrow windows instead of wrapping.
- Slightly more bottom padding so the taller text doesn't crowd the divider line.

## Technical notes

- Single edit to `src/components/tepilot/insights/TabHeader.tsx`: `text-base font-bold` to `text-2xl font-semibold tracking-tight` on the title, `text-[11px] text-slate-400` to `text-[14.5px] font-medium text-slate-700` on the subtitle, bump the icon size wrapper and header min-height/padding accordingly.
- No other files change; the System tab keeps its own header.
