

## Restructure customer info as a table header row

### What
Replace the dot-separated inline text with a proper table-style header showing column labels above the values. Also trim demographics to fields a bank would realistically have from account opening data.

### Fields to keep (bank-realistic)
- **Name** — from account application
- **Segment** — bank-assigned tier (Preferred/Private/Premium)
- **AUM** — tracked by the bank
- **Tenure** — known from account opening date
- **Age** — from DOB on file
- **Household** — family status from application (rename from "familyStatus")
- **Transactions** — count from the dataset
- **Total** — sum from the dataset

### Fields to remove
- **Occupation** — banks collect this but it's not typically surfaced in a customer selector
- **Income Level** — collected at application but sensitive; not displayed in a quick-select view
- **Industry** — not standard bank data

### UI change in `ExecDemoSelectionDialog.tsx` (lines 212–238)

Replace the current `flex-wrap` dot-separated block with a mini table-style layout:

```tsx
<div className="px-6 pt-3 pb-2 shrink-0">
  <div className="grid grid-cols-7 gap-4 text-[11px]">
    {/* Header row */}
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Name</span>
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Segment</span>
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">AUM</span>
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Tenure</span>
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Age</span>
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Household</span>
    <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px]">Transactions</span>
    {/* Value row */}
    <span className="font-bold text-slate-900 text-[13px]">{customer.profile.name}</span>
    <span className="text-slate-700 text-[13px]">{customer.profile.segment}</span>
    <span className="text-slate-700 text-[13px]">{customer.profile.aum}</span>
    <span className="text-slate-700 text-[13px]">{customer.profile.tenure}</span>
    <span className="text-slate-700 text-[13px]">{customer.profile.demographics?.age}</span>
    <span className="text-slate-700 text-[13px]">{customer.profile.demographics?.familyStatus}</span>
    <span className="text-slate-700 text-[13px]">{rawRows.length} · {customer.txnTotal}</span>
  </div>
</div>
```

Single file change: `src/components/exec-demo/ExecDemoSelectionDialog.tsx`, lines 212–238.

