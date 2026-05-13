# Match KYC header formatting to source cards

In `src/components/exec-demo/ExecDemoSelectionDialog.tsx` (line ~298), split the single "Anonymized · No PII" span into the same 3-span pattern used by source group headers:

```tsx
<span className="text-base font-semibold text-slate-700">Anonymized</span>
<span className="text-sm text-slate-400">·</span>
<span className="text-sm text-slate-500">No PII</span>
```

This matches spacing (parent already has `gap-3`), uses the smaller dot (`text-sm text-slate-400`), and renders the second part in grey (`text-slate-500`).
