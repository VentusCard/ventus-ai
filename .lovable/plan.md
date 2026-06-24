# Sidebar: expand-on-browse, collapse-on-select

Change the sidebar groups in `AnalyticsContainer.tsx` to a controlled accordion-style model.

## Behavior

1. **Default state**: only the group containing the currently active tab is expanded; all other groups are collapsed (just their label + chevron visible).
2. **Click a collapsed group label** → that group expands to reveal its sub-items. The previously active group stays open too, so the user can compare options while browsing. No navigation happens.
3. **Click a sub-item** → navigates to that tab AND collapses every other group, leaving only the newly active group expanded.
4. **Click an already-open group label** → collapses it (standard toggle), unless it contains the active tab (then it stays open to preserve context).

## Implementation

- Track open groups in local state: `const [openGroups, setOpenGroups] = useState<Set<string>>(new Set([activeGroupLabel]))`.
- Helper `activeGroupLabel = filteredNavGroups.find(g => g.items.some(i => i.value === activeTab))?.label`.
- `useEffect` on `activeTab`: reset `openGroups` to `new Set([activeGroupLabel])` — this is what collapses everything else after a selection.
- Replace each group's `<Collapsible defaultOpen>` with a controlled `<Collapsible open={openGroups.has(group.label)} onOpenChange={...}>`. The `onOpenChange` handler toggles that label in the set, but blocks closing the group that owns the active tab.
- Sub-item click already calls `setActiveTab(item.value)` — the effect above handles the collapse side-effect, so no extra logic in the button.
- Icon-collapsed sidebar (`collapsed` state) is unaffected: group labels are hidden in that mode, so the accordion logic doesn't apply visually.

No style changes, no nav structure changes, no changes to Settings/Feedback footer.
