# Fix the stretched Intelligence Dashboard layout

The Intelligence Dashboard content runs off the right edge of the screen: KPI cards, the spend chart and the priority strip are all cut off, and the sidebar/header stay put while the content is roughly twice the window width.

## Cause (measured in the live preview)

The main content column of the bank workspace has no minimum-width constraint. In a flex row, a flex item defaults to `min-width: auto`, so it grows to fit its widest child instead of the available space. Measured on /bankdemo at 1584px wide:

- window / shell: 1584px
- main column and dashboard body: 3081px

The outer shell has `overflow-hidden`, so the excess is simply clipped rather than scrollable — which is what "stretched out" looks like. Other tabs happen to have narrower intrinsic content, so the bug shows up most clearly on the dashboard.

## The fix

In the bank workspace shell (`AnalyticsContainer.tsx`):

- Add `min-w-0` to the main column wrapper (`flex-1 flex flex-col min-h-0`) so it shrinks to the space left by the sidebar.
- Add `min-w-0` to the inner content row (`flex flex-1 min-h-0`) for the same reason.
- Add `overflow-x-hidden` to the scrolling content area as a safety net so any single over-wide child cannot re-stretch the layout.

No changes to dashboard content, data, or styling — this is purely a layout constraint fix, and it applies to every tab in the workspace.

## Verification

Re-measure the width chain with a scripted browser pass at 1584px: the main column and dashboard body should both report the viewport width minus the sidebar, and a screenshot should show the full 6-column KPI row and the complete chart within the frame.
