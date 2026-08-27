# Intelligence Database: Soften the Priorities Chat Card

## Goal
Reduce the visual dominance of the priorities chat card in the Intelligence Database overview so it feels like a helpful assistant prompt rather than a dark banner.

## Current state
- The card is rendered by `renderSliver()` in `src/components/tepilot/insights/VentusAIDashboardView.tsx`.
- It currently uses a dark gradient (`from-slate-900 via-slate-800 to-blue-900`), white text, and a bright blue icon badge.
- It sits directly under the KPI strip and above the Signal families section.

## Proposed change
1. Replace the dark gradient with a light surface: white or very light slate background (`bg-slate-50` / `bg-white`) and a soft border (`border-slate-200`).
2. Downgrade text colors from white to slate-700/500 so the card matches the surrounding analytics panels.
3. Make the Ventus "V" badge smaller and softer (light blue tint instead of saturated blue-on-dark).
4. Keep the rolling priority animation and hover pause behavior unchanged.
5. Keep the click target that opens the Ventus chat.

## Files to edit
- `src/components/tepilot/insights/VentusAIDashboardView.tsx` — restyle the `renderSliver` card only.

## Acceptance criteria
- The priorities card no longer uses a dark gradient or white text.
- It visually recedes compared to the KPI strip and signal family cards.
- The rolling priority text and click-to-chat behavior still work.
