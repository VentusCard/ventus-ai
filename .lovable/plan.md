## Change
Update `supabase/functions/generate-product-cards/index.ts` prompt so every generated card includes concrete numeric offers and an estimated dollar benefit tied to the customer's actual signal.

## Edits

### 1. Add a new "NUMERIC SPECIFICITY" section to system prompt (after TONE RULES)
```
NUMERIC SPECIFICITY (MANDATORY):
Every card MUST include concrete numbers. Never use vague language like "great rates" or "earn more."

Required by field:
- offer_headline: Include the headline rate/percentage/multiplier.
  GOOD: "Auto refinance from 2.99% APR", "Earn 3x on travel, 2x on dining", "4.50% APY — 10x national average"
  BAD:  "Great auto refi rates", "Earn more when you travel"
- benefits (all 3): Each benefit MUST contain at least one specific number (%, $, x, months, points).
  GOOD: "$0 annual fee for the first year", "75,000 bonus points after $4K spend in 90 days", "0.25% rate discount for autopay"
  BAD:  "No annual fee", "Big signup bonus", "Autopay discount"
- quote: MUST contain ONE personalized dollar-estimate tied to the customer's actual behavior/signal.
  Derive the estimate from persona rollups (totalSpend), life-event financial_projection, or the signal context.
  Format: "You could save an estimated $XXX ..." or "That's roughly $XXX/year back on ..."
  Examples by card type:
    - Auto loan renewal (current payment ~$485/mo): "Refinancing at today's rates could save you an estimated $1,400 over the life of the loan."
    - Travel rewards card + tropical-getaway rollup ($4,200 travel spend): "At 3x on travel, that's roughly $215 back on your next island trip."
    - 529 for college prep: "Starting now with $250/mo could grow to an estimated $58,000 by freshman year."
    - HYSA: "On a $10K balance, that's about $450 more per year than the average savings account."
  The estimate must be plausible and grounded in the input data — do NOT invent unrelated numbers.
- eligibility: When possible include a numeric anchor: "Pre-qualified — rates from 2.99% APR", "FDIC insured up to $250,000", "Open with as little as $25".
- cta_sub: May include a number when relevant: "Funded in under 5 minutes", "Rate locked for 60 days".

Rate/economics guidance (use realistic 2026 figures):
- Auto refi APR: 5.49%–7.99% (well-qualified from 4.99%)
- HYSA APY: 4.00%–4.75%
- 529 avg annual growth: ~6%
- Travel card: 2x–5x travel, 2x–3x dining, 1x other; sign-up 60k–100k pts after $4k in 90 days
- HELOC: prime + 0%–2% variable
- Mortgage: 6.25%–7.25% 30yr fixed
- IRA/Roth contribution limits: $7,000 ($8,000 age 50+)
Never guarantee returns — use "estimated", "roughly", "could", "approximately".
```

### 2. Update `offer_headline` / `benefits` / `quote` field descriptions in the tool schema
- `offer_headline` description → add: "MUST include a specific rate, percentage, multiplier, or dollar figure."
- `benefits` items description → add: "Each of the 3 benefits MUST contain at least one concrete number (%, $, x, months, or points)."
- `quote` description → add: "MUST include one personalized dollar-estimate ('estimated $XXX') tied to the customer's actual signal or spending pattern."

### 3. Enrich user prompt payload for grounding
In the userPrompt, when serializing `persona_rollups`, also include `totalSpend` and `categories` (already there — verify) so the model can compute realistic dollar estimates. Add a short instruction line before "Return exactly 3 cards…":
```
Ground every dollar-estimate in the numbers above (rollup totalSpend, life-event financial_projection, demographics income). Do not invent unrelated figures.
```

## Non-changes
- Card count logic, card ordering, signal_label matching, risk-card removal, downstream rendering — all unchanged.
- No schema constraint tightening (no regex/minLength enforcing numbers — enforced via prompt, which the model reliably follows for Gemini 2.5).

## Acceptance
- Every card's `offer_headline` contains a rate/multiplier/percentage.
- All 3 `benefits` per card contain at least one number.
- Every `quote` contains an "estimated $" (or equivalent) figure that plausibly relates to the customer signal (e.g., car-loan card cites monthly payment savings; travel card cites cashback on their travel spend).
- No hallucinated numbers unrelated to the input (e.g., no "$50K bonus" for a checking account).