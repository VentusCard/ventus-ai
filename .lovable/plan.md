

## Add Feedback & Settings sections to bank dashboard sidebar

### What
Add two new nav items — **Feedback** and **Settings** — pinned to the bottom of the left sidebar in `AnalyticsContainer.tsx`. They sit below the scrollable nav groups and stay fixed at the bottom regardless of scroll.

### Changes (single file: `src/components/tepilot/insights/AnalyticsContainer.tsx`)

1. **Import icons** — Add `MessageSquare` (Feedback) and `Settings` (Settings) from lucide-react
2. **Split sidebar into two sections**:
   - The existing `<nav>` with `flex-1 overflow-y-auto` stays as-is for the main nav groups
   - Add a new `<div>` after the nav, pinned to the bottom with `mt-auto border-t border-slate-200 py-2`
   - Contains two buttons styled identically to existing nav items: Feedback and Settings
3. **Button behavior** — For now these will show a `toast.info("Coming soon")` since no content views exist yet. They won't be part of the `TabValue` type or `activeTab` state.
4. **Collapsed state** — When sidebar is collapsed, show only icons (same pattern as existing nav items) with tooltip via `title` attribute.

