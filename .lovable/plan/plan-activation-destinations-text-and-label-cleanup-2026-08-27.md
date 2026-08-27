# Plan: Activation destinations text and label cleanup

## Goal
Improve readability of the **Activation destinations** list in `/bankdemo` System tab and remove the trailing channel labels on each row.

## Changes
1. **Increase text sizes** in the Activation destinations section of `src/components/tepilot/insights/CapabilitiesView.tsx`:
   - Section title: keep current size or bump slightly for hierarchy.
   - Team label pill text: from `text-[11px]` to `text-[13px]`.
   - Destination name: from `text-[12.5px]` to `text-[14px]`.
   - Row minimum height: from `min-h-[38px]` to `min-h-[44px]` to accommodate larger text comfortably.
2. **Remove trailing channel labels**: delete the right-most `<span>` that renders `d.channel` (e.g., "Email", "In-app") from each destination row.
3. **Preserve layout**: keep the colored left bar, team label pill, destination name truncation, and rounded row styling.

## Verification
- Build the project and confirm no errors.
- Open `/bankdemo` System tab and verify the Activation destinations column shows larger text and no trailing channel pills.
