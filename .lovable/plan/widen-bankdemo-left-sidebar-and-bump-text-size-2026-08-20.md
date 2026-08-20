# Widen /bankdemo Left Sidebar and Bump Text Size

## Goal
Make the /bankdemo left sidebar slightly wider and increase the text size of its navigation items and group labels by one step.

## Changes
1. In `src/components/tepilot/insights/AnalyticsContainer.tsx`:
   - Increase default expanded sidebar width from `300px` to `340px`.
   - Increase minimum draggable width from `220px` to `260px`.
   - Increase maximum draggable width from `420px` to `460px`.
   - Keep collapsed width at `w-[52px]`.
   - Bump default nav item text from `text-[14px]` to `text-[15px]`.
   - Bump active nav item text from `text-[15px]` to `text-[16px]`.
   - Bump group label text from `text-[12px]` to `text-[13px]`.
   - Adjust horizontal padding/whitespace if needed so labels remain readable and do not wrap prematurely.

## Verification
- Open `/bankdemo` and confirm the sidebar is visibly wider on load.
- Confirm nav item labels and group labels are one font-size step larger.
- Confirm collapse, expand, and drag-to-resize behaviors still work correctly.
- Confirm no labels overflow or wrap unexpectedly at the new default width.
