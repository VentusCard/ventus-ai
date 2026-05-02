## Goal

When a user clicks a lifestyle pill (e.g. "Skiing") and asks a short, natural question ("how much do i spend on skiing?"), the assistant's reply should automatically return a **sub-component breakdown using the existing enriched categories/subcategories** — not invented buckets.

The data is already there. The fix is twofold:
1. Pass the existing enriched per-category breakdown into `signalContext`.
2. Tell the system prompt to use it verbatim.

## Where the change goes

### 1. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — enrich `signalContext`

In `handleRollupForRel` (around line 448-476), today we compute `merchantBreakdown` from `r.txIndices`. Add an analogous `categoryBreakdown` that buckets the same indices by their **enriched category / subcategory** (whichever the rollup spans).

Inputs available:
- `r.categories: string[]` — the categories included in this rollup.
- `r.txIndices: number[]` — the matching transaction indices.
- `enrichedTransactions[idx]` — has `category`, `subcategory`, `amount`, `normalized_merchant` (already used elsewhere on this page).

Logic:
```
const catMap: Record<string, { total: number; count: number; merchants: Set<string> }> = {};
for (const idx of r.txIndices) {
  const tx = enrichedTransactions?.[idx];
  if (!tx) continue;
  const bucket = tx.subcategory || tx.category || "Other";
  const amt = Math.abs(tx.amount || 0);
  if (!catMap[bucket]) catMap[bucket] = { total: 0, count: 0, merchants: new Set() };
  catMap[bucket].total += amt;
  catMap[bucket].count += 1;
  catMap[bucket].merchants.add(tx.normalized_merchant || tx.merchant_name);
}
const categoryBreakdown = Object.entries(catMap)
  .sort((a, b) => b[1].total - a[1].total)
  .map(([name, v]) => `${name} $${Math.round(v.total)} (${v.count}x, ${[...v.merchants].slice(0, 3).join(", ")})`)
  .join("; ");
```

Append to signalContext:
```
const signalContext =
  `Lifestyle rollup "${r.label}": total $${totalSpend.toLocaleString()} across ${totalCount} transaction${totalCount !== 1 ? "s" : ""}.` +
  (categoryBreakdown ? ` Breakdown by enriched subcategory: ${categoryBreakdown}.` : "") +
  merchantBreakdown;
```

This requires `enrichedTransactions` in scope inside `handleRollupForRel`. It's already a prop on the component (`enrichedTransactions?: ...`), just needs to be referenced (today the handler uses `transactions`).

### 2. `supabase/functions/consumer-chat/index.ts` — update the system prompt

In `CONSUMER_SYSTEM_PROMPT` (lines 30-105):

**a.** Add a new rule under TONE & RULES (or as a numbered capability):

> **LIFESTYLE BREAKDOWN** — When the user asks about spend on a lifestyle category and Signal Context contains a "Breakdown by enriched subcategory" line, reply with that breakdown verbatim as a bulleted list, then the total. Do NOT invent buckets, do NOT skip subcategories. Format:
>
> ```
> Your **{label}** spend:
> - **{Subcategory}** — $X ({top merchants})
> - **{Subcategory}** — $Y ({top merchants})
>
> **Total: $T**
> ```

**b.** Soften the existing succinctness rule (line 55) so a 4-6 line breakdown is allowed:

From:
> Be extremely succinct: 1-3 sentences max per response.

To:
> Be extremely succinct by default: 1-3 sentences for general questions. **Exception:** when Signal Context provides a subcategory breakdown, return it as a tight bulleted list + total — no preamble, no follow-up paragraph.

## What does NOT change

- The pill-text the user "types" stays short and casual (`"how much do I spend on {label}?"`).
- Life-event and risk handlers — unchanged.
- The `dispatchAIPrompt` signature, the chat view, the rest of the prompt builder — unchanged.

## Out of scope

- Inventing buckets the enrichment doesn't already produce.
- Re-classifying transactions on the fly.
- "Open AI Assistant" button.
