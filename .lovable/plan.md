Increase text size and contrast in the /bankdemo left sidebar

## Goal
Make the left sidebar in /bankdemo more legible by increasing text size by one step, making text appear whiter, and slightly increasing vertical spacing.

## Current State
- `src/components/tepilot/insights/AnalyticsContainer.tsx` renders the sidebar.
- Nav item labels are `text-[13px]` with `text-indigo-100/80` for inactive items.
- Collapsible group labels are `text-[11px]` with `text-indigo-200/70`.
- Nav item vertical padding is `py-1.5` and the icon-label gap is `gap-2.5`.
- Chevron icons in group labels are `text-indigo-200/70`.

## Changes
1. **Nav item text** — bump `text-[13px]` up to `text-[14px]` and increase whiteness from `text-indigo-100/80` to `text-indigo-50/90`.
2. **Group label text** — bump `text-[11px]` up to `text-[12px]` and increase whiteness from `text-indigo-200/70` to `text-indigo-100/90`.
3. **Group chevron icon** — increase whiteness from `text-indigo-200/70` to `text-indigo-100/80`.
4. **Spacing** — increase nav item vertical padding from `py-1.5` to `py-2` and the icon-label gap from `gap-2.5` to `gap-3`.
5. **Footer items** — apply the same nav-item style updates to the Feedback & Ideas and Settings buttons.
6. Verify the sidebar remains readable, group labels still fit, and the collapsed icon view is unaffected.

## Risks
- Slightly larger text may make long labels (e.g., "Intelligence Dashboard") truncate earlier in the default width; the existing draggable resize handle already compensates.
- Collapsed icon-only view should remain compact; the spacing changes only apply when the sidebar is expanded.
