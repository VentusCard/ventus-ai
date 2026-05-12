Apply the same size bump to Life Event pills and Risk Factor pills in `src/components/exec-demo/ExecDemoIntelPanel.tsx` so they match the lifestyle rollup pills.

**Edit 1 — Life event pill (line 628):**
- `text-[11px] ... px-3 ${isCollapsed ? "py-1" : "py-1.5"}` → `text-[13px] ... px-3.5 ${isCollapsed ? "py-1.5" : "py-2"}`

**Edit 2 — Life event meta sub-label (line 642):**
- `text-[11px]` → `text-xs`

**Edit 3 — Risk pill (line 764):**
- `text-[11px] px-3 ${isCollapsed ? "py-1" : "py-1.5"}` → `text-[13px] px-3.5 ${isCollapsed ? "py-1.5" : "py-2"}`

**Edit 4 — Risk meta sub-label (line 795):**
- `text-[11px]` → `text-xs`

No color, animation, or logic changes.