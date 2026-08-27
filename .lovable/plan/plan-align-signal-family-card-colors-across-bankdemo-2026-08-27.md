# Plan: align signal-family card colors across /bankdemo

## Goal
Make the 5 Intelligence Database signal-family cards more visually prominent and fix the color mismatch the user flagged (Life Event should be orange, Behavioral should be more blue).

## Current state
- The card colors are defined in `src/lib/customerDirectoryData.ts` (`SIGNAL_FAMILY_META`).
- Current Intelligence Database palette:
  - Behavioral → sky (light blue)
  - Life Event → violet (purple)
  - Financial → amber (orange)
  - Demographic → emerald (green)
  - Risk → rose (red)
- The System tab already uses a different, more intuitive mapping in `src/components/tepilot/insights/CapabilitiesView.tsx` (`SIGNAL_CHIP_TINTS`):
  - Behavioral → blue
  - Life Event → amber (orange)
  - Financial → emerald
  - Demographic → violet
  - Risk → rose
- This inconsistency is the source of the "COLOR MISMATCH" feedback.

## Changes
1. **Recolor `SIGNAL_FAMILY_META`** in `src/lib/customerDirectoryData.ts` to match the System-tab mapping and make each card more saturated/prominent:
   - Behavioral: switch from sky to blue family (`bg-blue-50`, `border-blue-200`, `bg-blue-500`, sparkline `#2563eb`, etc.)
   - Life Event: switch from violet to amber/orange family (`bg-amber-50`, `border-amber-200`, `bg-amber-500`, sparkline `#f59e0b`, etc.)
   - Financial: switch from amber to emerald family (`bg-emerald-50`, `border-emerald-200`, `bg-emerald-500`, sparkline `#10b981`, etc.)
   - Demographic: switch from emerald to violet family (`bg-violet-50`, `border-violet-200`, `bg-violet-500`, sparkline `#8b5cf6`, etc.)
   - Risk: keep rose family unchanged.
2. **Update `STRONG_PILL` palette** in `src/components/tepilot/insights/dashboard/SignalFamilyPanel.tsx` so the expanded signal pills use the same new family hues.
3. Keep all hover/active states, bar segments, and sparkline colors consistent with the new palette.

## Verification
- Open `/bankdemo` → Intelligence Database → Overview.
- Confirm the 5 family cards show: Behavioral (blue), Life Events (orange), Financial (emerald), Demographic (violet), Risk (rose).
- Confirm the expanded panel's "X% strong" pills match the new family colors.
- Check that no other UI surface (e.g., System tab chips) was accidentally changed.
