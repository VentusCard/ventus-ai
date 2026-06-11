## Clarify the 3/2/1 cashback structure

Update the `category-cashback-card` entry in `src/lib/productCatalogExtras.ts` (lines 107-120) so the tagline, rate table, and features all read the same way: **3% on your #1 category, 2% on your #2 category, 1% on everything else** — instead of the current copy that locks 2% to grocery + warehouse.

### Edit

```ts
"category-cashback-card": {
  tagline: "3% on your top category, 2% on your next, 1% on everything else.",
  fee: "No annual fee",
  rateTable: [
    { tier: "Your top category", rate: "3%", note: "highest-spend category each month" },
    { tier: "Your next category", rate: "2%", note: "second-highest, automatic" },
    { tier: "Everything else",   rate: "1%" },
  ],
  features: [
    "Top two categories detected from your spend each month — nothing to pick",
    "Quarterly cap on the 3% and 2% tiers, unlimited 1% beyond",
    "Cashback redeems as statement credit or to a linked deposit account",
  ],
},
```

### Downstream effect on message copy

`buildRatePhrase()` matches anchor parts (e.g. "Groceries", "Warehouse club") against tier text. With the new generic tier labels ("Your top category", "Your next category"), keyword lookups won't hit anymore — so the function will fall back to the top two tiers verbatim and produce:

> "3% on your top category and 2% on your next category"

That's actually clearer than naming specific categories in the headline, since the card works the same way for any anchor pair. The body still names the customer's actual categories via `anchorProse` elsewhere in the template.

### Out of scope

- Other mechanics entries.
- `buildMessageCards.ts` — no changes needed; the fallback path already handles this case.