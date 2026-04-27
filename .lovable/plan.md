## Goal

When a pill (e.g., "Annual Hawaiian Vacations") is active in the enrichment table, suppress the blue gradient highlight on enriched cells of all non-matching (dimmed) rows. Only the matched rows should retain visual emphasis, making the selection result much clearer.

## Change

**File:** `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

Today, every enriched cell carries the subtle blue gradient via `td.exec-enriched-cell`. When a pill is selected, dimmed rows keep that gradient (just at 32% opacity), which competes visually with the highlighted matches.

Update the styles so that when a pill is active, the gradient is removed from the dimmed rows' enriched cells — leaving them as plain neutral cells while the matched rows keep their accent treatment.

### Specifically

In the `<style>` block at the bottom of the file, add a rule:

```css
tr.exec-row-dimmed > td.exec-enriched-cell {
  background-image: none;
}
```

This pairs with the existing rules:
- `tr.exec-row-highlighted > td` already gets the accent tint (`--exec-hl` at 12%)
- `tr.exec-row-highlighted > td.exec-enriched-cell` already removes the blue gradient so the accent shows cleanly

After the change, when no pill is active, all enriched cells show the blue gradient as before. When a pill is active, only the matched rows are visually emphasized; the rest are flat and dimmed.

No JSX/structural changes. No animation changes.