

## Fix AnalyticsContainer to fill available space instead of overflowing

### Problem
`AnalyticsContainer` uses `h-screen` but it's rendered inside `DemoDetailOverlay` which already has a header bar (~56px). This means the container is 100vh tall inside a space that's already 100vh minus the overlay header — causing the "spill over" effect.

### Fix (single file: `src/components/tepilot/insights/AnalyticsContainer.tsx`)

Change the outer container class from `h-screen` to `h-full` so it fills whatever parent space is available rather than forcing viewport height. The parent (`DemoDetailOverlay`) already handles the full-screen layout with `absolute inset-0` and gives the content area `flex-1 overflow-y-auto`.

**Line 96**: `h-screen` → `h-full`

This single change makes the dashboard fit within the overlay's content area without exceeding it, while still working correctly in other contexts (like `TePilot.tsx`).

