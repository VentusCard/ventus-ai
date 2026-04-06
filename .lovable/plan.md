

## Expand "Supporting Evidence" to Full Page

### What Changes

When the user clicks "Supporting evidence" after synthesis, the 3-column layout collapses: the left panel and phone shrink to narrow icon-button columns, and the intel panel expands to fill the viewport — restoring the full-height pill view similar to pre-synthesis.

### Implementation

**`src/pages/ExecDemoPage.tsx`**
1. Add a `pillsExpanded` state lifted from the intel panel.
2. Pass it down as a prop + an `onPillsExpandedChange` callback to `ExecDemoIntelPanel`.
3. Change the grid template dynamically: when `pillsExpanded` is true, switch from `grid-cols-[320px_1fr_360px]` to `grid-cols-[48px_1fr_48px]` with a CSS transition. The left panel and phone columns become narrow strips showing only a collapse/restore button.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
4. Remove internal `pillsExpanded` state — accept it as a prop instead, along with the toggle callback.
5. When `pillsExpanded` is true post-synthesis, remove the `maxHeight: 45vh` cap on the persona card so pills fill the available space (same as pre-synthesis layout with `flex-1 min-h-0`).

**`src/components/exec-demo/ExecDemoLeftPanel.tsx`**
6. Accept a `collapsed` prop. When true, render only a small vertical icon button (e.g., `PanelLeft` icon) instead of the full customer/transaction panel.

**`src/components/exec-demo/ExecDemoPhoneView.tsx`**
7. Accept a `collapsed` prop. When true, render only a small vertical icon button (e.g., `Smartphone` icon) instead of the phone mockup.

### Files
- `src/pages/ExecDemoPage.tsx` — lift state, dynamic grid
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — externalize pillsExpanded, remove maxHeight when expanded
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` — collapsed mode
- `src/components/exec-demo/ExecDemoPhoneView.tsx` — collapsed mode

