

## Improve Rollup Pill Accuracy and Specificity

### Problem
1. **Spend-tier mismatch** — "Premium Urban Gastronome" for Chipotle/Olive Garden/Trader Joe's. The AI has no visibility into actual merchant names or spending tiers.
2. **Too abstract** — "Connected Digital Subscriber" for Netflix/Hulu/Spotify/HBO. Labels use corporate jargon instead of intuitive descriptions.
3. **Missing specific signals** — subcategories like "Golf", "Streaming", "Yoga" aren't passed, so the AI can't use them.

### Root Cause
The `firePersonaSynthesis` function only sends `pillar`, `label` (category), `count`, `totalSpend`, and `frequency` to the edge function. It omits:
- **Top merchant names** (available from `enrichedTxs[].normalized_merchant`)
- **Spending tier** (available from `enrichedTxs[].spending_tier`)
- **Subcategories** (available from `enrichedTxs[].subcategories`)

Without this context, the AI guesses tier and generates abstract labels.

### Changes

**1. `src/pages/ExecDemoPage.tsx` — Pass richer data per category**

In `firePersonaSynthesis`, when grouping signals, also collect merchant names, spending tiers, and subcategories from the enriched transactions:

```typescript
// Enhanced grouping — collect merchants, tiers, subcategories per category
const grouped = new Map<string, {
  pillar: string; label: string; count: number; totalSpend: number;
  frequency?: string; txIndices: number[];
  topMerchants: string[]; spendingTier: string; subcategories: string[];
}>();

for (const [txIdx, tx] of enrichedTxs.entries()) {
  const key = `${tx.pillar}::${tx.category}`;
  const existing = grouped.get(key);
  if (existing) {
    existing.count += 1;
    existing.totalSpend += tx.amount;
    existing.txIndices.push(txIdx);
    if (tx.normalized_merchant && !existing.topMerchants.includes(tx.normalized_merchant))
      existing.topMerchants.push(tx.normalized_merchant);
    if (tx.subcategories) tx.subcategories.forEach(sc => {
      if (!existing.subcategories.includes(sc)) existing.subcategories.push(sc);
    });
  } else {
    grouped.set(key, {
      pillar: tx.pillar, label: tx.category, count: 1, totalSpend: tx.amount,
      frequency: tx.purchase_frequency, txIndices: [txIdx],
      topMerchants: tx.normalized_merchant ? [tx.normalized_merchant] : [],
      spendingTier: tx.spending_tier || "Standard",
      subcategories: tx.subcategories ? [...tx.subcategories] : [],
    });
  }
}
```

The `pillars` payload sent to the edge function will now include `topMerchants`, `spendingTier`, and `subcategories`.

**2. `supabase/functions/synthesize-persona/index.ts` — Use richer context in prompt**

Update the input summary to include merchants, tier, and subcategories:

```typescript
const pillarSummary = pillars
  .map((p, i) => {
    const merchants = p.topMerchants?.length
      ? ` merchants: ${p.topMerchants.slice(0, 5).join(", ")}` : "";
    const tier = p.spendingTier ? ` [${p.spendingTier}]` : "";
    const subs = p.subcategories?.length
      ? ` subs: ${p.subcategories.slice(0, 5).join(", ")}` : "";
    return `[${i}] ${p.pillar} > ${p.label}: ${p.count} txns, $${p.totalSpend.toFixed(0)}${tier}${merchants}${subs}`;
  })
  .join("\n");
```

Rewrite the rollup label instructions in the system prompt:

```
- CRITICAL: Look at the [Budget/Standard/Premium] tier tag AND the actual merchant names.
  Do NOT use "Premium", "Luxury", or "Elite" unless the tier is [Premium] AND merchants confirm it
  (e.g. Nobu, Four Seasons, Gucci). Chipotle + Olive Garden = NOT premium.
- Use subcategory signals when available to be MORE SPECIFIC.
  E.g. if subcategories include "Golf", say "Avid Golfer" not "Sports Enthusiast".
  If merchants are Netflix + Hulu + Spotify, say "Streaming Entertainment Buff" not "Digital Subscriber".
- Prefer descriptive, intuitive labels that capture WHAT the person does.
  Good: "Streaming Entertainment Buff", "Casual Dining Regular", "Weekend Golfer", "Boutique Fitness Fan"
  Bad: "Connected Digital Subscriber", "Premium Urban Gastronome", "Holistic Wellness Advocate"
```

### Expected Result
- "Chipotle + Olive Garden + Trader Joe's [Standard]" → "Casual Dining Regular" not "Premium Urban Gastronome"
- "Netflix + Hulu + Spotify + HBO [Standard]" → "Streaming Entertainment Buff"
- Subcategories like "Golf" produce "Weekend Golfer" instead of generic "Sports Enthusiast"
- Tier prefixes like "Premium" or "Luxury" only appear when both the tier tag and merchant names justify it

