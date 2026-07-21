## Fix duplicated text in external financial pill

**Cause**: In `src/components/exec-demo/ExecDemoIntelPanel.tsx` (~L1106-1114), the external financial pill sublabel joins `fs.detail` and `fs.monthly_amount_band` with " · ". For the Auto Loan Renewal signal, `detail = "VW Credit · ~$685/mo"` already contains `monthly_amount_band = "~$685/mo"`, producing "VW Credit · ~$685/mo · ~$685/mo".

**Fix**: Show `fs.detail` only. If `detail` is missing, fall back to `monthly_amount_band`. No other files change.

```ts
if (isExternal) {
  const sub = fs.detail || fs.monthly_amount_band;
  return sub ? (
    <span className="text-[11.5px] opacity-60 tabular-nums font-normal">{sub}</span>
  ) : null;
}
```

Result: pill reads `Ext  Auto Loan Renewal  VW Credit · ~$685/mo`.