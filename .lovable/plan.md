

## AI-Generated Engagement Actions for Product Cards

### What
Replace the hardcoded action pills ("Signal Sent to Mobile App", "Notify Wealth Advisor", etc.) with dynamically generated actions from a new edge function. The AI will receive full customer context (life events, persona, demographics, spending pillars, product cards) and generate 2–5 actions per card that blend standard banking engagement with deeply personal "wow factor" actions — things like sending flowers for an anniversary, a curated college visit itinerary, or a handwritten card for a milestone — that only make sense given the customer's specific life context.

### New Edge Function: `supabase/functions/generate-product-actions/index.ts`

**Inputs** (same context already available in the pipeline):
- `product_cards` — the 2 cards from generate-product-cards
- `persona_rollups` — behavioral persona labels and spending patterns
- `life_events` — detected life events with evidence
- `demographics` — age, occupation, family status
- `pillars` — top spending categories

**Output** (via tool calling):
```json
{
  "card_actions": [
    {
      "card_index": 0,
      "actions": [
        { "label": "Signal Sent to Mobile App", "icon": "smartphone", "color": "blue", "tone": "standard" },
        { "label": "Send Anniversary Flowers via Concierge", "icon": "heart", "color": "rose", "tone": "wow" }
      ]
    }
  ]
}
```

**Prompt strategy**:
- 1–2 standard actions (notify advisor, trigger email, push notification, flag for review)
- 1–3 wow actions that feel like a personal concierge: send a card, flowers, curated itinerary, milestone gift, proactive insurance check, personalized savings challenge — whatever the context justifies
- Wow actions should feel like "my bank genuinely cares about my life" not "my bank is surveilling me"
- Model: `google/gemini-2.5-flash` (fast structured output)

### Frontend Changes

**`src/components/exec-demo/NextProductRationale.tsx`**:
- Add optional `productActions` prop with type for the response
- Replace the hardcoded `{isBehavioral ? ... : ...}` action pills block with dynamic rendering from `productActions`
- Map icon strings → lucide components (smartphone, mail, user-check, calendar, heart, gift, shield, lightbulb, star, compass, flower, pen-line)
- "Wow" actions get a subtle sparkle accent and slightly richer styling (gradient border or star prefix)
- Fallback: show current hardcoded pills while actions are loading or if the call fails

**`src/pages/ExecDemoPage.tsx`**:
- Add `productActions` state
- After `generate-product-cards` resolves, fire `generate-product-actions` with product cards + same context
- Pass `productActions` to `NextProductRationale`

### Config

Add to `supabase/config.toml`:
```toml
[functions.generate-product-actions]
verify_jwt = false
```

### Technical Details
- Icon set: ~12 lucide icons mapped by string name
- Fallback: if edge function fails or is loading, render current hardcoded pills unchanged
- No new dependencies

