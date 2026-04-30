## Problem

On the Next-Offer tab, the phone view doesn't appear and the left transaction column stays visible. The user expects: middle column + phone view (transaction column hidden).

## Root cause

`ExecDemoIntelPanel.tsx` was refactored so the Next-Offer tab now uses the `"analytics"` TabKey (see line 76: `analytics: { icon: BarChart3, label: "Next-Offer" }` and line 82: `TAB_ORDER = ["analytics", "product", "relationship"]`).

But `ExecDemoPage.tsx` still uses the old key list when deciding when to hide the transaction column and show the phone:

- Line 982: `const isNextTab = activeTab === "rewards" || activeTab === "product" || activeTab === "relationship";`
- Line 1087: same check, duplicated for the phone column.

Neither includes `"analytics"`, so on the Next-Offer tab both checks evaluate false → transaction column stays, phone stays hidden.

## Fix

In `src/pages/ExecDemoPage.tsx`, add `"analytics"` to both `isNextTab` / `phoneVisible` checks (lines 982 and 1087). After the change:

```ts
const isNextTab =
  activeTab === "analytics" ||
  activeTab === "rewards" ||
  activeTab === "product" ||
  activeTab === "relationship";
```

(Keeping `"rewards"` in the list is harmless since it's no longer in `TAB_ORDER`, but it's safe to leave for backward compatibility.)

No other files change. No layout/styling changes.
