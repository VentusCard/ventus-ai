Change the System tab source-group expansion from multi-select to single-select: only one input provider may be expanded at a time.

### Changes

1. **State shape** — Replace `const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())` with `const [openGroup, setOpenGroup] = useState<string | null>(null)`.

2. **Toggle logic** — In the `SourceGroupCard` toggle callback for each mapped group:
   - If the clicked group is already open, close it (`setOpenGroup(null)`).
   - Otherwise, open it and close any previously open group (`setOpenGroup(g.provider)`).

3. **`isOpen` prop** — Change from `openGroups.has(g.provider)` to `openGroup === g.provider`.

### No other changes
- `SourceGroupCard` component internals remain the same.
- All other tabs, panels, and state (signal selection, team selection, etc.) are untouched.