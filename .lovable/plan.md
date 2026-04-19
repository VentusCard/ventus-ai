

## Answer: what gets sent to `generate-next-offers`

Tracing `ExecDemoPage.tsx` → `fireNextOffers`:

```ts
POST /functions/v1/generate-next-offers
{
  "rollups": [
    // Behavioral rollups (from persona.pillarRollups)
    {
      "label": "Upscale Hawaii Traveler",
      "pillar": "Travel",
      "categories": ["Hotels","Airlines","Dining"],
      "topMerchants": ["FOUR SEASONS MAUI","HAWAIIAN AIR",...],
      "totalCount": 12
    },
    // …more behavioral rollups…

    // Life-event rollups (from lifeEvents array)
    {
      "label": "Home Purchase",         // ← e.event_name verbatim
      "pillar": "Life Event",
      "categories": [/* derived from enrichedTxs ∩ evidence merchants */],
      "topMerchants": [/* e.evidence[].merchant */],
      "totalCount": <evidence count>
    }
  ]
}
```

The edge function then formats this into a numbered prompt:

```
1. label: "Upscale Hawaii Traveler" | pillar: "Travel" — categories: Hotels, Airlines — recent merchants: …
2. label: "Home Purchase" | pillar: "Life Event" — categories: … — recent merchants: …
```

It tells Gemini to echo the exact `label` and `pillar` strings back, then returns:

```json
{ "rollupOffers": [
    { "rollup": "Upscale Hawaii Traveler", "pillar": "Travel", "deals": [...] },
    { "rollup": "Home Purchase", "pillar": "Life Event", "deals": [...] }
] }
```

## Why "Home Purchase" still fails

The matching IS exact — but Gemini occasionally:
1. **Drops the life-event group entirely** (returns only the behavioral rollups), or
2. **Renames it** (e.g. "Home Purchase" → "New Home Essentials"), or
3. **Returns it but with a slightly different casing/punctuation** the normalizer doesn't catch.

When any of those happen, `NextOfferRationale` finds 0 hits → empty state. We've layered prompt instructions 3 times; the LLM still drifts.

## What I want approval to do

Stop trusting the LLM with labels. Two-line server fix in `supabase/functions/generate-next-offers/index.ts`:

1. **Switch contract to index-based**: ask AI to return `rollupIndex` (1, 2, 3…) per group instead of a label string. Numbers are dramatically more reliable for LLMs than long strings.
2. **Server re-attaches verbatim labels**: after parse, `rollup` and `pillar` are overwritten from `validRollups[index-1]`. AI cannot drift.
3. **Backstops**:
   - If `rollupIndex` is missing but the AI returned exactly N groups in order → use positional mapping.
   - If a rollup has no group in the response → emit an empty placeholder `{ rollup: src.label, pillar: src.pillar, deals: [], collectionMessage: "Curating offers for ${src.label}…" }` so the panel always shows the correct themed card.
4. **Add one log line**: `[OFFERS] Rewrote N groups; inputs: [...]` so we can verify in edge function logs.

No client-side changes. No prompt restructuring beyond the `rollupIndex` contract change.

## Result
- Click "Home Purchase" → server guarantees a group with `rollup: "Home Purchase"` exists → exact match → deals (or themed empty card) render.
- Behavioral pills continue to work identically.

## Out of scope
- Phone mockup view (already pinned correctly)
- Persona / life-event detection
- Pill UI

