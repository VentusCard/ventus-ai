In `src/components/tepilot/insights/AnalyticsContainer.tsx`, render the "Home" group as a plain always-expanded section (no `Collapsible`, no `CollapsibleTrigger`, no chevron):

- In the sidebar nav groups map, branch on `group.label === "Home"`:
  - Render the `SidebarGroupLabel` directly (no trigger button, no chevron icon), followed by `SidebarGroupContent` with its items always visible.
  - Skip adding "Home" to the `openGroups` accordion state logic — it's not controlled.
- All other groups keep the existing controlled `Collapsible` accordion behavior unchanged.
- In `collapsed` (icon) sidebar mode, behavior is unchanged since labels are hidden.

No style, navigation, or item changes.