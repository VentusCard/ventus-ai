## New Edge Function: Generate Consumer Product Cards

### What It Does

A new edge function `generate-product-cards` that takes life events + persona/spending data and returns exactly **two consumer-facing product recommendation cards**:

1. **Behavioral card** — tied to spending patterns/persona rollups (e.g., frequent Hawaii trips → travel card). Specific enough to feel personal, vague enough to not feel creepy.
2. **Life-event card** — tied to a detected life event (e.g., college prep → 529/HYSA). Subtle, empathetic copy that feels like "good timing" not surveillance.

Each card has: a product name, a one-liner quote, a short rationale, and a color/theme hint.

### Changes

**1. New edge function: `supabase/functions/generate-product-cards/index.ts**`

- Accepts: `{ life_events, persona_rollups, pillars, demographics }`
- Uses Lovable AI (Gemini 2.5 Flash) with a carefully crafted prompt enforcing the "sweet spot" tone
- Returns exactly 2 cards via tool calling:
  ```json
  {
    "cards": [
           {
        "type": "behavioral",
        "product_name": "Venture X Travel Card",
        "quote": "Reward your tropical getaways. A travel card that works as hard as you vacation.",
        "behavioral_signal": "Annual Hawaiian trips",
        "theme": "travel"
         }    
         {
        "type": "life_event",
        "product_name": "529 College Savings Plan",
        "quote": "Big milestones ahead? Start putting your money to work now — explore a 529 or High-Yield Savings Account.",
        "event_name": "College Preparation",
        "theme": "education"
      },
      
    ]
  }
  ```
- Prompt enforces the Ventus thesis: specific enough to feel "they get me", vague enough to never feel surveilled

**2. Update `src/pages/ExecDemoPage.tsx**`

- Add state: `productCards` and `productCardsLoading`
- After persona synthesis completes, fire `generate-product-cards` in parallel with existing calls, passing life events (once available) + persona rollups + pillars + demographics
- Pass `productCards` down to `ExecDemoPhoneView`

**3. New component: `src/components/exec-demo/ProductCardsPhoneView.tsx**`

- Renders two styled cards in the phone mockup for the "product" tab
- Card 1 (life-event): soft colored background matching theme, product name as pill, quote as main text, subtle "Learn More" CTA
- Card 2 (behavioral): dark gradient card, behavioral signal as subtle tag, quote as main text, product name prominent
- Clean, consumer-app aesthetic matching existing phone views

**4. Update `src/components/exec-demo/ExecDemoPhoneView.tsx**`

- Accept new `productCards` prop
- In the `product` case, render `ProductCardsPhoneView` instead of `ProductRecommendationPhoneView`

**5. Update `src/components/exec-demo/NextProductRationale.tsx**` (intelligence panel)

- Show the two cards' reasoning: which life event triggered card 1, which behavioral pattern triggered card 2
- Keep existing life event evidence display but reframe around the two-card output

### Prompt Design (Key Excerpt)

The edge function prompt will enforce:

- Card 1 must reference a specific life event but frame the copy as a general financial wellness tip
- Card 2 must reference a behavioral pattern using a "vaguely specific" descriptor (e.g., "tropical getaways" not "your 3 trips to Maui")
- Quotes must be 1-2 sentences, conversational, never mention "we noticed" or "based on your transactions"
- The customer should think "good timing" not "they're watching me"

### Flow

```text
persona synthesis completes
  ├── generate-next-offers (existing, parallel)
  ├── analyze-lifestyle-signals (existing, parallel)
  │     └── on complete → generate-product-cards (life_events + persona + pillars)
  │                          └── sets productCards state → phone renders 2 cards
```

One new edge function, one new component, two files updated.