# Widen Left Sidebar for "Personalization Orchestration"

## Goal
Prevent the "Personalization Orchestration" section label in the `/bankdemo` left sidebar from wrapping to two lines.

## Current State
- `src/components/tepilot/insights/AnalyticsContainer.tsx` renders the sidebar at `w-[240px]` when expanded.
- The group label "Personalization Orchestration" is rendered in `text-[11px]` uppercase and wraps at that width.

## Changes
1. Update the expanded sidebar width class in `AnalyticsContainer.tsx` from `w-[240px]` to a width that fits the longest label on one line (target `w-[280px]` or `w-[300px]`).
2. Keep collapsed width (`w-[52px]`) and all transition/behavior logic unchanged.
3. Verify in the preview that the label no longer wraps and the layout remains balanced.

## Risks
- Widening the sidebar reduces the main content area; choose the smallest width that solves the wrap without over-shrinking content.
