

## Fix Sidebar to Fit Full Height When Expanded

### Problem
When all sidebar groups in the AnalyticsContainer are expanded, the nav items overflow slightly, requiring a scroll. The goal is to make everything fit perfectly within the available height.

### Approach
Tighten vertical spacing throughout the sidebar so all 14 nav items, 5 group headers, the collapse button, and 2 footer items fit without overflow.

### Changes — `src/components/tepilot/insights/AnalyticsContainer.tsx`

1. **Reduce collapse button height**: `h-10` → `h-8`
2. **Reduce nav container padding**: `py-2` → `py-1`
3. **Reduce group header padding**: `py-2` → `py-1.5` on `CollapsibleTrigger`
4. **Reduce nav item padding**: `py-2` / `py-2.5` → `py-1.5` on each nav button
5. **Reduce group divider margins**: `my-1` → `my-0.5`
6. **Reduce footer padding**: `py-2` → `py-1` on footer container, and `py-2.5`/`py-2` → `py-1.5` on footer buttons
7. **Use smaller text**: `text-sm` → `text-[13px]` on nav items (optional, only if still tight)

These are purely spacing tweaks — no layout restructuring needed.

