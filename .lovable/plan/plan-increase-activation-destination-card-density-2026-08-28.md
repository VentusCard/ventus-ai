# Plan: Increase Activation Destination Card Density

## Goal
Make the **Activation destinations** cards in the System tab flow diagram larger and more legible so they fill the available column height better.

## Current State
Each destination row is currently compact:
- Row height: `min-h-[44px]`
- Icon tile: `h-7 w-7` with a `h-3.5 w-3.5` icon
- Destination name: `text-[14px]`
- Navigation button: `h-7 w-7` with a `h-3.5 w-3.5` arrow icon
- Row gap: `gap-2.5`

This leaves unused vertical space in the right-hand column, especially when the walkthrough is on step 3 and the column is fully active.

## Changes

1. **Increase row height** from `min-h-[44px]` to `min-h-[54px]` so each card has more presence.
2. **Enlarge the icon tile** from `h-7 w-7` to `h-9 w-9` and round it slightly more (`rounded-md` to `rounded-lg`).
3. **Increase icon size** inside the tile from `h-3.5 w-3.5` to `h-4.5 w-4.5` (using `h-[18px] w-[18px]` if `h-4.5` is unavailable).
4. **Bump the destination name** from `text-[14px]` to `text-[15px]` or `text-base` for better readability.
5. **Increase the navigation button** from `h-7 w-7` to `h-8 w-8` and its arrow icon to `h-4 w-4` so it feels proportional to the larger row.
6. **Slightly increase row gap** from `gap-2.5` to `gap-3` so the larger cards breathe.
7. **Verify** the column still fits all 7 destinations without internal scrolling at the current panel height (~410px).

## Files to Modify
- `src/components/tepilot/insights/CapabilitiesView.tsx` — update the destination row styling around the `visibleDestinations.map` render block.
