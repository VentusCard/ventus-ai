## Plan: Navigation Panel Polish

### Changes
1. **Font & icon sizing bump** (left nav panel only):
   - Group headers: `text-[11px]` → `text-[12px]`, `text-slate-400` → `text-slate-500`
   - Nav item labels: `text-[13px]` → `text-[14px]`, inactive `text-slate-600` → `text-slate-700`
   - Icons: `w-4 h-4` → `w-[18px] h-[18px]` (inactive stays `text-slate-400`)

2. **Collapse all sections by default**:
   - Change `<Collapsible defaultOpen>` → `<Collapsible defaultOpen={false}>` on every nav group
   - Group headers remain visible; their items are hidden until the user expands

### Scope
- File: `src/components/tepilot/insights/AnalyticsContainer.tsx` only
- No changes to tablet/mobile breakpoints, sidebar width, or content panels

### Out of scope
- Header fonts, content area fonts, chat panel, or any other component