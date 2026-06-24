Remove the "Ventus" signature badge shown on certain report cards in the Reports library, since every report is run by us and the label adds noise.

## Change

**`src/components/tepilot/insights/reports/ReportsLibrary.tsx`**
- Delete the `{t.signature && (... Ventus ...)}` badge block (lines ~431-436) from the report card header. The category badge stays.
- Remove the now-unused `Sparkles` import if no other usage remains.
- Leave the `signature` field on `ReportTemplate` and on individual templates alone (data-only; not surfaced). No other UI or logic changes.

No edits to query engine, ResultActionsBar, or other components.