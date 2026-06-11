Fix: clicking "Targeting" jumps back to Ventus AI welcome.

## Root cause
In `AnalyticsContainer.tsx`, `validTabs` is built only from items inside `filteredNavGroups` (plus `settings`/`feedback`). The new `targeting-overview` tab is not a nav item, so it's missing from `validTabs`. The `useEffect` then sees `activeTab` as "invalid" and resets to `'ventus-ai'`.

## Change
In the `validTabs` `useMemo`, also add overview tabs whose parent group is enabled. Concretely: if a group labeled "Targeting" is present in `filteredNavGroups`, add `'targeting-overview'` to the set. Structured as a small lookup so future section overviews drop in the same way.

No other behavior changes. Files: `src/components/tepilot/insights/AnalyticsContainer.tsx` only.
