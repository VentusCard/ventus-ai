

## Plan: Elaborate transaction hover tooltip with MCC + enrichment details

### Data changes in `src/components/exec-demo/execDemoData.ts`

1. **Extend `SignalEntry` interface** — add `mcc`, `mccDescription`, `category`, `subcategory`, `tier` fields:
   ```ts
   export interface SignalEntry {
     pillar: string;
     label: string;       // subcategory
     amount: number;
     frequency?: string;
     mcc?: string;
     mccDescription?: string;
     category?: string;
     tier?: string;
   }
   ```

2. **Extend `MCC_SIGNAL_MAP`** — add `category`, `tier`, and `frequency` to each entry where appropriate (e.g. Airlines → category: "Air Travel", tier: "Premium", frequency: "Occasional").

3. **Update `buildSignalMap`** — import `MCC_DESCRIPTIONS` from `@/lib/sampleData` and populate `mcc` and `mccDescription` on each `SignalEntry` from the CSV row's MCC code.

### Tooltip changes in `src/components/exec-demo/ExecDemoLeftPanel.tsx`

4. **Redesign the tooltip** in `TxRow` to show two rows:
   - **Row 1**: `MCC: 4511 · Airlines — Scheduled Air Transportation`
   - **Row 2**: `Pillar: Travel & Transport · Category: Air Travel · Subcategory: Airlines · Tier: Premium · Frequency: Occasional`

   Uses a stacked layout inside the existing dark tooltip div, with the pillar name colored by its dot color.

### Files modified
- `src/components/exec-demo/execDemoData.ts`
- `src/components/exec-demo/ExecDemoLeftPanel.tsx`

