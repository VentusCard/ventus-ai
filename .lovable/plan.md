# Plan: Make the Settings footer button actually open the Settings page

## Root cause

In `src/components/tepilot/insights/AnalyticsContainer.tsx`, the `validTabs` `useMemo` (lines 119-123) only includes values from `filteredNavGroups`. Since `settings` lives in the bottom footer (not in `NAV_GROUPS`), it's never in `validTabs`. The `useEffect` at lines 126-130 then treats `activeTab === 'settings'` as invalid and immediately resets to `'ventus-ai'`, so clicking Settings does nothing visible.

## Change

**`src/components/tepilot/insights/AnalyticsContainer.tsx`** — add `'settings'` to the `validTabs` set so the auto-reset effect leaves it alone:

```ts
const validTabs = useMemo(() => {
  const set = new Set<TabValue>();
  filteredNavGroups.forEach(g => g.items.forEach(i => set.add(i.value)));
  set.add('settings'); // footer-anchored, always available
  return set;
}, [filteredNavGroups]);
```

No other files change. The footer button already calls `setActiveTab('settings')` and `renderContent()` already returns `<SettingsContainer />` for that case.
