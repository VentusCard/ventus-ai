# Fix pill click not visually highlighting transaction rows

## What's broken

When you click a pill (Gambling, College Preparation, etc.), the "Showing N of M" strip appears at the top of the enrichment table — proving the click and the index list both work — but the matching rows in the table do not get visually highlighted, and the non-matching rows do not get dimmed.

## Root cause

The highlight is being applied as inline `background` + `box-shadow` + `opacity` styles on the `<tr>` element. Browsers do not reliably paint background colors or box-shadows on `<tr>` elements when the table uses `border-collapse: collapse` (which this table does). The styles are computed correctly, just never rendered.

## Fix

Move the highlight styling off `<tr>` and onto its child `<td>` cells via CSS classes that target the descendants:

- Add a CSS rule (scoped to the table, in a `<style>` block inside `ExecDemoEnrichmentTable.tsx`) such that:
  - `tr.exec-row-highlighted > td` gets a light tinted background (using the active pill color) and the first `td` shows a colored left border.
  - `tr.exec-row-dimmed > td` gets `opacity: 0.32`.
- On each `<tr>`, set the appropriate class (`exec-row-highlighted`, `exec-row-dimmed`, or neither) and pass the active pill color via a CSS custom property (`--exec-hl`) so the rule can reference it.
- Keep the existing hover behavior (`hover:bg-slate-50/60`) for rows that aren't being filtered.

After this change the matching rows will show a colored left bar + tinted background, the non-matching rows will fade to ~32% opacity, and clicking a different pill or "Clear" will swap or remove the styling — matching what the "Showing N of M" strip is already telling the user.

## File to edit

- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` — replace the inline `<tr style={...}>` with class-based styling and add the corresponding `<style>` block.
