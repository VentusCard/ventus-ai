Add a disabled "Digital Telemetry — Coming soon" card as the **last** card inside the scrollable transaction area in `src/components/exec-demo/ExecDemoSelectionDialog.tsx`.

**Placement**: Inside `<ScrollArea>`, within the same `space-y-2` wrapper, immediately after the closing `})}` of `sourceGroups.map(...)` — making it the final item in the list.

**Styling**: Same outer shape as source group cards but visually disabled:
- `rounded-xl border border-dashed border-slate-200 bg-slate-50/60 overflow-hidden opacity-70 cursor-not-allowed`
- Non-interactive (plain `<div>`, no toggle handler, no state)

**Header row** (mirrors source card header layout):
- Left: pill `bg-slate-200 text-slate-500` labeled "Digital Telemetry", then `text-sm font-semibold text-slate-400` "Coming soon", `·` separator, `text-xs text-slate-400` hint "App, web & device signals"
- Right: static `ChevronDown` in `text-slate-300` (no rotation)

**Files**: Only `src/components/exec-demo/ExecDemoSelectionDialog.tsx`.