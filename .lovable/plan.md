# Green full battery on all /deckmo phone mockups

## Goal
Every phone mockup in /deckmo shows a green, fully charged battery icon in the status bar.

## Current state (verified)
The deck's phones come from two places, both rendering the plain lucide `Battery` icon in slate-400:
1. `src/components/deckmo/DeckmoRecentTransactionsTab.tsx:115` — its own status bar (Immediate Value slide).
2. `src/components/exec-demo/ExecDemoPhoneView.tsx:225` — frame chrome shared with /demo and /bankdemo (renders the Mid-term and Long-term slides via `ExactPhone` in DeckmoBankdemoScenes.tsx).

## Changes
1. **ExecDemoPhoneView.tsx** — add an optional `batteryFull?: boolean` prop (default false). When true, render the lucide `BatteryFull` icon with `text-emerald-500` instead of the plain battery. No change for /demo or /bankdemo.
2. **DeckmoBankdemoScenes.tsx (`ExactPhone`)** — pass `batteryFull` to ExecDemoPhoneView so the Mid-term and Long-term phones get the green full battery.
3. **DeckmoRecentTransactionsTab.tsx** — swap its `Battery` icon for `BatteryFull` with `text-emerald-500` (deck-only file, no prop needed).

## Verification
- Playwright at 1540×855 on slides 5 (Immediate), 7 (Mid-term), 10 (Long-term): status bar shows the green full battery on every phone; no clipping.
- Spot-check /demo or /bankdemo phone: battery icon unchanged.
- Build log clean.
