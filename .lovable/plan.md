# Selected tab highlight in /bankdemo sidebar

Make the active left-sidebar tab more visually prominent by enlarging, whitening, and teal-coloring its label and icon.

## What will change

- In `src/components/tepilot/insights/AnalyticsContainer.tsx`, update the selected-state styles for sidebar navigation items.
  - **Text**: one size larger than the default `text-[14px]` (use `text-[15px]`) and switch to pure white (`text-white`).
  - **Icon**: switch from indigo to teal (`text-teal-400`).
  - Keep the existing active background (`bg-white/10`), left border, and shadow so the change is additive.
- Apply the same treatment to both the main nav groups and the footer-anchored items (Settings, Feedback & Ideas).
- Collapsed state should still show only the teal icon.

## Files to update

- `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Modify `navButtonClasses` to bump font size and set `text-white` when `isActive`.
  - Modify `navIconClasses` to use `text-teal-400` when `isActive`.

## Validation

- Run TypeScript typecheck to confirm no broken class references.
- Verify in preview that the selected tab text is larger/whiter and its icon is teal, while non-selected tabs remain unchanged.
