

## Use Classified Pillars for Pills & Add Frequency

### Problem
Pills currently use MCC-based pillar/label from `buildSignalMap`. The `classify-transactions` response includes richer `pillar`, `category`, and `purchase_frequency` fields that should be used instead. Frequency is not shown in pills.

### Changes

**1. `src/components/exec-demo/execDemoData.ts`**
- Add `frequency` field to `SignalEntry`: `{ pillar, label, amount, frequency?: string }`
- Update `EnrichedTransaction` interface to include `purchase_frequency: string`
- Update `buildSignalMapFromClassified` to pass through `purchase_frequency` into the `frequency` field of `SignalEntry`
- Keep `buildSignalMap` (MCC fallback) unchanged — frequency will be undefined for fallback signals

**2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Add `frequency` to `ChipData` interface (most common frequency across grouped signals)
- Update `deriveChips` to track and pick the dominant frequency for each chip group
- Update `AnimatedChip` to display frequency: format becomes **label · count× · $amount · frequency** (e.g. "Airlines · 4× · $2.3k · Monthly")
- Frequency shown in a slightly muted style after the spend amount

### Visual Result
Each pill will show: `Airlines · 4× · $2.3k · Monthly` with the frequency in a subtle opacity style matching the spend amount.

### Files
1. `src/components/exec-demo/execDemoData.ts` — add frequency to SignalEntry, pass through from classified results
2. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — display frequency in chips

