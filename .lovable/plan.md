

## Remove Lifestyle Descriptions and Show Full Transaction List

### Changes in `src/components/exec-demo/ExecDemoLeftPanel.tsx`

**1. Remove the `lifestyleType` line from customer cards**
- Delete line 293: `<div className="text-[10px] text-blue-400 truncate">{c.lifestyleType}</div>`

**2. Show all transactions in idle preview instead of first 15**
- Change the idle preview from `previewTxns` (capped at 15) to `cappedTxns` (up to 80)
- Make the idle preview container scrollable (`overflow-y-auto`) so users can scroll through all transactions

