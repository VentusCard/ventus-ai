## Change
Update `supabase/functions/generate-product-cards/index.ts` prompt + tool to emit **exactly 3 cards: 2 life-event + 1 behavioral**, no risk card.

## Edits

### 1. System prompt (lines 37–47)
Replace CARD ORDER block:

```
CARD ORDER (STRICT):
Emit cards in exactly this order:
  1. Life Event card based on life_events[0]
  2. Life Event card based on life_events[1]
  3. Behavioral card based on persona_rollups[0]

RULES:
- Always emit 3 cards when 2+ life events AND 1+ rollup exist.
- If only 1 life event exists → emit [life_event_1, behavioral_1] (2 cards).
- If no life events exist → emit [behavioral_1] only (1 card).
- If no rollups exist → emit life event cards only (up to 2).
- NEVER emit a risk card.
- The two life-event cards MUST recommend DIFFERENT products and cover DIFFERENT financial needs — do not repeat the same product family.
```

### 2. Remove all risk-card logic
- Strip `topRisk` computation (lines ~20–32) and the RISK CARD section (lines 93–119).
- Remove `risk_flags` destructure use for card generation (keep in body for backward-compat but ignore).
- Remove `"risk"` from `type` enum.
- Remove RISK SIGNAL block from `userPrompt` (line 199–200).

### 3. User prompt tail (line 202)
Change to: `Return exactly 3 cards (2 life events + 1 behavioral) in the strict order using the generate_product_cards function.`

### 4. Tool definition
- `description`: "Return up to 3 consumer product recommendation cards in strict order: life_event_1, life_event_2, behavioral_1"
- `cards.maxItems`: 3 (from 5)
- `type` enum: `["behavioral", "life_event"]`

### 5. `src/pages/ExecDemoPage.tsx` (line 729)
Keep `merged.slice(0, 3)` so 2 life events fit; no change needed.

## Acceptance
- Product-cards phone view shows 3 cards: 2 life-event (car loan renewal + next detected event) + 1 behavioral.
- No risk card ever appears in Next-Product, regardless of risk flags.
- signal_labels still match pill labels verbatim so pill-click filtering works.
- Downstream (rationale, actions) unchanged — they already iterate `productCards` without card-type assumptions.