## Goal

Show the "raw" transaction columns (description + MCC) inside the enrichment table, so the executive demo visually communicates the transformation from raw bank-statement format → enriched semantic labels.

The new structure mirrors `/tepilot`'s enrichment view but is tailored for the executive demo: raw input on the left of the arrow, enriched output on the right.

## Changes

### 1. `src/pages/ExecDemoPage.tsx` — pass raw `description` + `mcc` through

Where we merge `source` from raw txs onto enriched txs (around lines 169–178), also merge `description` and `mcc`:

```ts
const merged = enriched.map((etx, i) => {
  const raw: any = rawTxs[i];
  return {
    ...etx,
    ...(raw?.source && !(etx as any).source ? { source: raw.source } : {}),
    ...(raw?.description ? { description: raw.description } : {}),
    ...(raw?.mcc ? { mcc: raw.mcc } : {}),
  };
});
```

### 2. `src/components/exec-demo/execDemoData.ts` — extend type

Add the optional raw fields to `EnrichedTransaction`:

```ts
export interface EnrichedTransaction {
  // ...existing
  description?: string;
  mcc?: string;
  source?: string;
}
```

Also ensure `csvToClassifyPayload` passes through `description` and `mcc` (it already does). No edge-function changes needed — these fields just ride alongside on the client.

### 3. `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` — add raw columns

Restructure the table into two visual halves separated by the existing arrow column:

**Left (raw / "as received"):**
- Date
- Merchant (raw `merchant_name`)
- Description (raw, truncated, `title=` for full text)
- MCC (mono, small chip)
- Amount

**→ arrow column**

**Right (enriched / "AI-labeled"):**
- Source (chip)
- Pillar (colored chip)
- Category
- Subcategories (chips)
- Tier
- Frequency
- Confidence

Header treatment:
- Add a two-tier `<thead>`: top row spans "Raw Transaction" (5 cols) | spacer | "Enriched (AI)" (7 cols), with subtle background tints (slate-50 vs blue-50) so the before/after split reads at a glance.
- Keep existing per-column header row underneath.
- Make the table `min-w-[1280px]` to accommodate the extra columns; container stays `overflow-auto`.

Empty/missing values render as "—". Description column is the widest text cell (`max-w-[160px] truncate`), MCC renders as a slate mono chip.

### 4. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — update skeleton

The pre-data skeleton (around line 714) currently mirrors the old single-section table. Update its column count / widths so the layout doesn't jump when real data arrives — add placeholder cells for the new Description and MCC columns and the "Raw / Enriched" two-tier header.

## Files

- `src/pages/ExecDemoPage.tsx` (merge raw fields onto enriched txs)
- `src/components/exec-demo/execDemoData.ts` (extend `EnrichedTransaction` type)
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` (add raw columns + two-tier header)
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` (skeleton matches new layout)

No changes to the edge function, no behavioral changes to "Behavioral Intelligence" trigger or post-synthesis flow.