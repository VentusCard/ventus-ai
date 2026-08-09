# Widen and Make Draggable the Left Sidebar

## Goal
Ensure the "Personalization Orchestration" section label in the `/bankdemo` left sidebar fits on one line, and let users drag the sidebar edge to resize it on the spot.

## Current State
- `src/components/tepilot/insights/AnalyticsContainer.tsx` renders the sidebar at a fixed `w-[240px]` when expanded.
- The group label "Personalization Orchestration" wraps at that width.
- There is no drag handle for resizing the sidebar.

## Changes
1. **Default width increase**: Change the expanded sidebar width from `w-[240px]` to a width that keeps "Personalization Orchestration" on one line (target `w-[280px]` or `w-[300px]`).
2. **Draggable resize**: Add a drag handle on the right edge of the sidebar that lets users adjust its width horizontally.
   - Track width in component state with a sensible min (e.g., `200px`) and max (e.g., `400px`).
   - Use pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) on a thin hit target on the sidebar's right border.
   - Apply a resizing cursor (`cursor-col-resize`) and a subtle hover/active state on the handle.
   - Preserve existing collapse behavior (`w-[52px]`); disable dragging while collapsed.
   - Keep transitions smooth but suppress the width transition during active dragging to avoid lag.
3. Verify in the preview that the label no longer wraps, dragging works smoothly, and the main content area responds correctly.

## Risks
- Widening the sidebar reduces main content area; the draggable handle lets users compensate.
- Drag events must be bound to the document during drag to handle fast mouse movements outside the handle.
