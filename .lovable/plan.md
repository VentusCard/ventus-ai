## Uniform pill sublabel across all 5 intel families (external pills stay visually distinct)

Scoped to `src/components/exec-demo/ExecDemoIntelPanel.tsx` only.

### Two visual classes

**A. Standard (customer-transaction-derived) pills** — one uniform sublabel:

```
N txn(s) · $amount
```

- `N` = supporting transaction count for that pill.
- `$amount` = sum of those transactions, via existing `formatSpend` (`$12.0k`, `$685`).
- Leading glyph and color per family stay as today (`✦` amber for life event, `◆` indigo for financial, `✦` teal for demographic, `⚠` for risk, pillar color for spending rollup).
- Drop from sublabels: life-event `X%`, risk `severity` word, financial `~$/mo` band, demographic freeform `magnitude_band` — these move to the pill's hover `title` so the visible strip is uniform.

Applies to: spending rollup pills (already close — normalize), life events without `source === "external"`, financial signals without `source === "external"`, demographic shifts without `source === "external"`, risk pills.

**B. External-boosted pills** — stay visually distinct, keep richer sublabel:

```
[Ext badge] Label  · Renewal in ~2mo · ~$685/mo
```

- Keep the violet `Ext` badge, violet border, and violet hover tooltip that already exist.
- Sublabel is the external `detail` (e.g. `Renewal in ~2mo`) + the existing `monthly_amount_band` / `magnitude_band` (e.g. `~$685/mo`), joined with ` · `.
- If only one of the two is present, render just that one; never fall back to txn-count/$ for externals since they aren't customer-transaction-derived.
- No `N txns · $amount` on external pills — that's the whole visual signal that this came from outside data.

Applies to: any life event, financial signal, or demographic shift with `source === "external"` (today this is the auto-loan renewal fixture; the pattern generalizes to future external signals).

### How standard-pill stats are derived

A single helper inside the render closure:

```
resolvePillStats(indices?: number[], evidence?: {amount:number}[]) => { count, spend }
```

1. If `transaction_indices` is non-empty and `transactions` is loaded → `count = indices.length`, `spend = sum(transactions[i].amount)`.
2. Else if the family carries `evidence[]` with `amount` (life events do) → `count = evidence.length`, `spend = sum(evidence.amount)`.
3. Else → `count = 0`, `spend = 0`, sublabel renders as `0 txns · —` so rescue-merged pills (e.g. a College Preparation life event with no linked indices) still read uniformly.

Per family:
- Spending rollup (`PillarRollupChip`): keep existing `totalCount` / `totalSpend`, route through the shared format.
- Life event: prefer evidence; fall back to `matchedIndices` (already computed locally against `transactions`).
- Financial signal: `transaction_indices` on the LLM record.
- Demographic shift: `transaction_indices` on the LLM record.
- Risk rollup: reuse the already-computed `matchedIndices`, sum `transactions[i].amount`.

### Out of scope

- Pill ordering, colors, glyphs, animations, click behavior, muting on Next-Offer.
- Expanded vs collapsed layout — both share the same renderers, so both update together.
- Backend / edge functions, enrichment table, tablet mockup, downstream generators.

### Files touched

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — add `resolvePillStats` helper; branch each of the 5 pill renderers on `source === "external"`; update trailing `<span>` sublabels accordingly; move dropped fields into `title` attributes.
