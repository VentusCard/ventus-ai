# Resize Selection Dialog Table to Match Enrichment Table

The transaction table inside `ExecDemoSelectionDialog` currently uses smaller text (9–11px) than the main enrichment table on the demo page (which uses 11–12px). This makes the two views feel inconsistent. I'll bring the dialog's table typography in line with `ExecDemoEnrichmentTable`.

## Changes — `src/components/exec-demo/ExecDemoSelectionDialog.tsx`

**Header text and section title**
- Dialog title: `text-[14px]` → `text-[15px]`
- Subtitle: `text-[11px]` → `text-[12px]`
- Pill buttons: `text-[12px]` → `text-[13px]` (slight bump for consistency)

**Table — header row** (match enrichment table's tier-2 header style)
- `<tr>` background → `bg-slate-50/80` with `border-slate-200`
- `<th>` cells → `text-slate-600 text-[11px] font-semibold uppercase tracking-wider px-2 py-2 whitespace-nowrap`

**Table — body rows** (match enrichment table cell sizing)
- Cell padding: `py-1.5 pr-3` → `px-2 py-1.5`
- Source badge: `text-[9px]` → `text-[10.5px]`, `px-1.5 py-0.5`
- ID (txn id): `text-[10px]` → `text-[11px]` font-mono
- Date: keep `text-slate-500 tabular-nums`, bump to `text-[12px]`
- Merchant: `text-[11px]` → `text-[12px]` font-medium
- MCC: `text-[10px]` → `text-[11px]` font-mono, wrap in slate-100 chip like enrichment table
- MCC Description: `text-[11px]` → `text-[11.5px]` font-mono text-slate-500 (matches enrichment "Description" column)
- Amount: `text-[11px]` → `text-[12px]` font-mono tabular-nums
- Zip: `text-[10px]` → `text-[11px]`

**Footer CTA button** — leave as-is (already 13px, prominent).

## Out of scope
- Column order (already matches enrichment table: Source first).
- Custom-flow form (separate UI section, not the transaction table).
- Pills row layout.

## Result
The selection dialog's transaction preview will read at the same density and weight as the main enrichment table, so users perceive them as the same data surface at two stages of the flow.
