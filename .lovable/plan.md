

## Plan: Add Category + Multi-Label Subcategories to Classification

### The Correction

You're right on two points:

1. **Category = the primary behavioral identifier.** For Sports, that's the sport (Golf, Running). For Food, that's the venue type (Grocery, Coffee & Cafes, Dining Out). Current subcategories already serve this role — they get **promoted** to Category.

2. **Subcategories = up to 3 independent labels** that describe what we can reasonably infer from the merchant name alone. They're tags, not a taxonomy — no need to be MECE with each other. And critically: **don't hallucinate** — only tag what the merchant name actually tells you.

```text
Whole Foods → Food & Dining / Grocery / ["Organic & Natural"]
   NOT ["Organic & Natural", "Prepared Foods", "Wine & Spirits"]
   We only know it's an organic-leaning grocery store.

TaylorMade → Sports & Active Living / Golf / ["Equipment"]
   The merchant name tells us golf equipment specifically.

Starbucks → Food & Dining / Coffee & Cafes / ["Chain"]
   One label is fine. Don't force 3.

REI → Sports & Active Living / Outdoor & Adventure / ["Equipment", "Apparel"]
   REI reasonably sells both — 2 labels.
```

### Files Modified

| File | Change |
|---|---|
| `supabase/functions/classify-transactions/index.ts` | Promote subcategories to `category`; add `subcategories` array (1-3 labels) to prompt, tool schema, merge logic |
| `src/types/transaction.ts` | Add `category: string`, `subcategories: string[]`; keep `subcategory` as `subcategories[0]` |
| `src/components/tepilot/ResultsTable.tsx` | Add Category column; render subcategories as small badges |
| `src/components/demo/DemoEnrichmentTableView.tsx` | Add Category column; render subcategories |

### Edge Function Changes

**1. Prompt taxonomy** — Current subcategories become categories. New instruction for subcategory labels:

```
PILLARS & CATEGORIES:

1. Sports & Active Living: Golf, Running, Tennis, Skiing, Cycling, 
   Water Sports, Gym & Fitness, Outdoor & Adventure, Team Sports, General

2. Food & Dining: Grocery, Coffee & Cafes, Dining Out, Fast Food, 
   Delivery & Takeout, Meal Kits & Subscriptions, Bars & Nightlife, General

3. Health & Wellness: Medical & Doctor, Pharmacy, Mental Health, 
   Spa & Massage, Vitamins & Supplements, Health Insurance, General

...same pattern for all pillars...

SUBCATEGORY LABELS (1-3 per transaction):
Return 1 to 3 short labels that describe what you can ACTUALLY INFER 
from the merchant name. These are independent tags, not a hierarchy.

Only tag what the merchant name tells you. Do NOT guess what the 
customer bought if the merchant sells many things.

Examples:
- "TAYLORMADE" → ["Equipment"] (we know it's golf equipment)
- "WHOLE FOODS" → ["Organic & Natural"] (known positioning)
- "REI" → ["Equipment", "Apparel"] (REI clearly sells both)
- "STARBUCKS" → ["Chain"] (that's all we know)
- "MARIO'S PIZZA" → ["Italian", "Casual"] (pizza = Italian + casual)
- "EQUINOX" → ["Premium", "Membership"] (known luxury gym)
- "CVS" → ["Prescription", "OTC"] (pharmacy sells both)
- "SHELL" → ["Gas"] (one label is fine)
```

**2. Tool schema** — Add `category`, change `subcategory` to `subcategories`:

```json
"category": {
  "type": "string",
  "description": "Primary behavioral identifier within the pillar (e.g. Golf, Grocery, Coffee & Cafes, Flights)"
},
"subcategories": {
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "maxItems": 3,
  "description": "1-3 labels describing what can be inferred from the merchant name. Only tag what is obvious — do not guess."
}
```

Add both to `required` array.

**3. Merge logic** (line ~632):
```typescript
category: classification.category || "General",
subcategories: Array.isArray(classification.subcategories)
  ? classification.subcategories
  : [classification.subcategory || "General"],
subcategory: (Array.isArray(classification.subcategories)
  ? classification.subcategories[0]
  : classification.subcategory) || "General",
```

**4. Fallback** (line ~623):
```typescript
category: "General",
subcategories: ["General"],
subcategory: "General",
```

### Type Update

```typescript
export interface EnrichedTransaction extends Transaction {
  normalized_merchant: string;
  pillar: string;
  category: string;           // Primary identifier (Golf, Grocery, Flights)
  subcategories: string[];    // 1-3 inferred labels
  subcategory: string;        // = subcategories[0], backward compat
  confidence: number;
  // ... rest unchanged
}
```

### UI — ResultsTable & DemoEnrichmentTableView

- New **Category** column between Pillar and Subcategory, rendered as a colored badge
- **Subcategory** column renders `subcategories` as small comma-separated text or stacked mini-badges
- All 28+ files using `transaction.subcategory` continue working unchanged

