

## Fix: Custom Customer Transaction Preview

### Problem
When a custom customer is loaded via the paste flow, the transaction feed in the left panel stays empty until "Run Analysis" is clicked. This is because `customTransactions` comes from `profile?.transactions`, but the profile is only built when the analysis runs.

### Fix

**`src/pages/ExecDemoPage.tsx`**
- In `handleLoadCustomCsv`, immediately build a local profile using `buildLocalProfile(csv, selectedIdx, name)` and set it in state via `setProfile(...)`. This populates `profile.transactions` right away, so the left panel can render the transaction preview before "Run Analysis" is clicked.

This is a one-line addition — call `setProfile(buildLocalProfile(csv, 0, name))` inside `handleLoadCustomCsv`.

### Files
1. `src/pages/ExecDemoPage.tsx` — add `setProfile(buildLocalProfile(csv, 0, name))` in `handleLoadCustomCsv`

