# Plan: Make the sidebar footer visible

## Root cause

`BankAnalyticsDashboard` wraps the container in `min-h-screen flex flex-col` (no fixed height). `AnalyticsContainer`'s root is `h-full`, which resolves to auto. The sidebar's `nav` is `flex-1 overflow-y-auto` — in an unbounded flex column it grows to fit all nav items rather than scrolling, so the footer renders below the viewport fold and `mt-auto` never gets any free space to push against.

## Change

**`src/pages/BankAnalyticsDashboard.tsx`**
- Change the wrapper `div` className from `tepilot-theme min-h-screen bg-white flex flex-col` to `tepilot-theme h-screen bg-white flex flex-col overflow-hidden`.

This is the only change needed. With `h-screen` the AnalyticsContainer's `h-full` becomes a real bounded height, `flex flex-1 min-h-0` on the body row constrains the sidebar, the nav scrolls internally via its existing `overflow-y-auto`, and the footer pins to the bottom via `mt-auto`.

## Verification

After the change, on `/bankdemo` the left sidebar should always show, at its bottom, "Feedback & Ideas" above "Settings", regardless of how many nav items are in the list. The nav above scrolls inside the sidebar instead of pushing the footer off-screen.

No other files need changes — the footer markup in `AnalyticsContainer.tsx` (lines 253–278) is already correct.
