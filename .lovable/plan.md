

## Fix: "Supporting Evidence" Expands Within Middle Panel (Keeping Headline + Rollups)

### What Changes

When clicking "Supporting evidence" after synthesis, the tab bar and tab content hide, and the persona card (with headline + rollup pills + category pills) expands to fill the full middle panel height — same as the pre-synthesis layout but keeping the synthesis UI elements visible.

### Changes — single file

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

1. Make `pillsExpanded` internal state (no longer a prop — revert to local `useState`).
2. When `pillsExpanded && synthesisTriggered`:
   - Keep the AI headline and rollup pills visible (no change there).
   - **Hide** the tab bar and tab content sections.
   - Remove the `maxHeight: 45vh` cap on the persona card — let it use `flex-1 min-h-0` to fill the panel.
3. The "Supporting evidence" toggle button already exists (line 280-286) — no change needed there.

**`src/pages/ExecDemoPage.tsx`**
4. Remove the lifted `pillsExpanded` state + `onPillsExpandedChange` callback. Revert grid to static `grid-cols-[320px_1fr_360px]`.
5. Remove `collapsed`/`onExpand` props from left panel and phone view.

**`src/components/exec-demo/ExecDemoLeftPanel.tsx`**
6. Remove `collapsed`/`onExpand` prop and collapsed icon-strip rendering.

**`src/components/exec-demo/ExecDemoPhoneView.tsx`**
7. Remove `collapsed`/`onExpand` prop and collapsed icon-strip rendering.

### Key logic (IntelPanel)
- Persona card gets `flex-1 min-h-0` when `!synthesisTriggered || pillsExpanded` (already on line 218).
- `maxHeight: 45vh` only applies when `synthesisTriggered && !pillsExpanded` (already on line 224).
- Tab bar + tab content: wrap in `{!(synthesisTriggered && pillsExpanded) && (...)}` to hide when evidence is expanded.

