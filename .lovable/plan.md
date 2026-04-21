

## Fix lifestyle rollup pill → AI chat: bake exact totals into the prompt

**The bug:** Clicking the "✦ **Seasonal Ski Trips** · 4 txns · $1.0k" rollup pill sends the AI the prompt *"How much do I typically spend on seasonal ski trips?"* — and the AI replies *"$537 across 3 transactions"* instead of the real *$1.0k across 4 transactions*.

**Root cause:** The chat context (`buildContext` in `ConsumerAIChatView.tsx` → `consumer-chat`) only ships **pillar / category** aggregates. But the rollup label "Seasonal Ski Trips" is a **sub-cluster** computed by the persona-synthesis step (it groups Palisades Tahoe lift tickets, ski rentals, ski apparel, etc. across multiple categories). The AI has no way to recompute that exact cluster from the categories it sees, so it guesses based on whatever single ski-related category looks closest — and gets a smaller, wrong number.

The pill itself **already knows** the right answer: `r.totalSpend`, `r.totalCount`, and `r.txIndices` are right there on the rollup. We just need to inject them into the prompt.

### Change

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx` — `handleRollupForRel` (~line 389)

Replace the bare prompt with one that bakes in the rollup's ground-truth totals + a top-merchant breakdown derived from `r.txIndices` against the `transactions` array already in scope:

```ts
const handleRollupForRel = (r: typeof rollupStats[number]) => {
  onRollupClick?.(r);
  if (!isRelTab) return;
  setSelectedSignal({ kind: "lifestyle", label: r.label });
  if (!assistantOpen) return;

  const totalSpend = Math.round(r.totalSpend ?? 0);
  const totalCount = r.totalCount ?? 0;

  // Top-merchant breakdown for this exact cluster
  let merchantBreakdown = "";
  if (transactions && r.txIndices?.length) {
    const mMap: Record<string, { total: number; count: number }> = {};
    for (const idx of r.txIndices) {
      const tx: any = transactions[idx];
      if (!tx) continue;
      const name = tx.normalized_merchant || tx.merchant_name || tx.merchant || "Unknown";
      const amt = typeof tx.amount === "number"
        ? Math.abs(tx.amount)
        : Math.abs(parseFloat(String(tx.amount).replace(/[^0-9.\-]/g, "")) || 0);
      mMap[name] ??= { total: 0, count: 0 };
      mMap[name].total += amt;
      mMap[name].count += 1;
    }
    const top = Object.entries(mMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([n, v]) => `${n} $${Math.round(v.total)} (${v.count}x)`);
    if (top.length) merchantBreakdown = ` Breakdown: ${top.join("; ")}.`;
  }

  const prompt =
    `How much do I typically spend on ${r.label.toLowerCase()}? ` +
    `(Use these exact figures from my account: total $${totalSpend.toLocaleString()} ` +
    `across ${totalCount} transaction${totalCount !== 1 ? "s" : ""} tagged "${r.label}".` +
    `${merchantBreakdown})`;

  onAIPromptDispatch?.(prompt, "lifestyle");
};
```

### Why this works

The `consumer-chat` system prompt already says *"never fabricate transaction data"* and *"always cite specific dollar amounts and merchant names"*. By feeding the AI the exact total + merchant breakdown for the cluster as part of the user message, it will quote those numbers verbatim in its reply — matching the pill exactly.

### Resulting flow

- Click ✦ **Seasonal Ski Trips · 4 txns · $1.0k** → AI replies *"You spent **$1,037** across **4 transactions** on seasonal ski trips, primarily at Palisades Tahoe ($720, 2x)…"* — matches the pill.
- Same fix automatically corrects every other lifestyle rollup pill (Annual Hawaiian Vacations, Tennis & Court Sports, etc.) — they all use this same handler.
- Life-event and risk pills are unaffected (separate handlers).

### Files touched

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — only `handleRollupForRel` body.

No edge function, schema, or `consumer-chat` prompt changes.

