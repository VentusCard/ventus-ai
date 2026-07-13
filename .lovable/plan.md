## Problem

In `/bankdemo`, clicking the **Demo** tab renders `ExecDemoPage` with `embedded`, which initializes `selectionDialogOpen` to `!embedded` (i.e. `false`). So the customer-selection popup never appears.

Previously we suppressed the popup because it was auto-firing right after password login — but that was only an issue when Demo was the landing tab. Now that Demo isn't the default landing tab, the popup should open whenever the user actively clicks into the Demo tab.

## Change

**File:** `src/pages/ExecDemoPage.tsx` (line 62)

- Change `useState(!embedded)` → `useState(true)` so the selection dialog opens on mount in both standalone and embedded contexts.

The `exec-demo` case in `AnalyticsContainer.tsx` remounts `ExecDemoPage` on every tab switch (React switch-case render), so this will reliably show the popup each time the user clicks the Demo tab.

No other changes to embedded behavior (single-customer restriction, back button, etc.) are affected.
