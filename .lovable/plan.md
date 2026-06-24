## Goal

On `/bankdemo`, remove the separate "Demo" sidebar entry and surface the executive demo as a section at the bottom of the "System" page, reached via a button placed under the illustrative diagram.

## Changes

### 1. `src/components/tepilot/insights/CapabilitiesView.tsx`
- Import `ExecDemoPage` from `@/pages/ExecDemoPage`.
- Below the existing diagram card, add:
  - A centered CTA row: heading like "See it in action" with a primary button "Launch interactive demo" that smooth-scrolls to an anchor (`#exec-demo`) further down.
  - A new `<section id="exec-demo">` wrapper styled to match the diagram card (white bg, `border border-slate-200 rounded-xl`, padding), containing `<ExecDemoPage embedded onBack={...} />`. The `onBack` is a no-op or scrolls back up to the diagram since there is no longer a separate tab to return to.
- Keep all existing diagram markup unchanged.

### 2. `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Remove the `{ value: "exec-demo", label: "Demo", icon: Presentation }` entry from `NAV_GROUPS` (line 72).
- Remove the `'exec-demo'` case from the `renderContent` switch (around line 197) and the now-unused `ExecDemoPage` import (line 21) and `Presentation` icon import if no other usage.
- Remove `'exec-demo'` from the `TabValue` union (line 58).
- If `defaultTab` or any internal navigation targeted `'exec-demo'`, repoint to `'capabilities'`.

### 3. No route changes
- `/demo` route (standalone `ExecDemoPage`) stays as-is; only the in-dashboard sub-tab is merged.

## Technical notes

- `ExecDemoPage` already supports `embedded` + `onBack` props (used today inside the dashboard), so it drops cleanly into the section.
- The button uses an in-page anchor with `scrollIntoView({ behavior: 'smooth' })`; no router change.
- Styling follows the strict light theme (white bg, slate-200 borders, Manrope) per project rules.
