

## AI-Generated Deal Recommendations for Next-Offer

### Concept
Instead of searching a static deal library, a new edge function will use the synthesized persona + enriched transaction data to **generate** contextually extended deals — inferring adjacent products from behavioral patterns (skier → GoPro, boards) and personalizing messages using demographic context (family of 4 → "Capture precious family moments").

### Architecture

```text
classify-transactions → synthesize-persona
                              ↓
                     generate-next-offers  ← NEW edge function
                              ↓
                     Phone View (deals + messages)
                     Intel Panel (rationale cards)
```

### Changes

**New edge function: `supabase/functions/generate-next-offers/index.ts`** (~120 lines)

Takes as input:
- `persona`: headline + pillar rollups (from synthesize-persona)
- `pillars`: top spending categories with merchants, spend, subcategories
- `demographics`: occupation, family status, income tier
- `timeline`: purchase cycle data (recency, frequency, seasonality)

The AI prompt instructs it to:
1. For each top pillar rollup, generate 1-2 **extended** deals — adjacent products the customer would logically want but hasn't bought (skier → GoPro, snowboard gear)
2. Generate 1 discovery deal from an untapped category
3. For each deal, produce: merchant name, product, reward value, a personalized message (using demographics), and a short rationale explaining the behavioral inference
4. Return 4-6 deals total

Output shape:
```json
{
  "offers": [
    {
      "id": "gen_1",
      "merchant": "GoPro",
      "product": "HERO13 Black",
      "category": "Technology",
      "rewardType": "discount",
      "rewardValue": "15% Off",
      "message": "Capture precious family moments on the mountain with helmet-mounted HERO13",
      "cta": "Gear Up for Slopes",
      "rationale": "Active skier with family of 4 — high affinity for action cameras",
      "sourceRollup": "Mountain Enthusiast"
    }
  ]
}
```

Uses `google/gemini-3-flash-preview` via Lovable AI gateway. Standard CORS headers.

**New component: `src/components/exec-demo/NextOfferRationale.tsx`** (~160 lines)

The middle panel content when "Next-Offer" tab is active. Shows:
1. **Strategy header**: "X behavioral signals → Y personalized offers" with persona headline badge
2. **Offer rationale cards** (one per generated deal): pillar-colored left border, merchant + product + reward, the personalized message, and a "why" section showing the behavioral inference chain (e.g., "Ski passes + jackets + family of 4 → action camera")
3. Loading skeleton while the edge function runs

Props: `personaSynthesis`, `enrichedTransactions`, `demographics` (from customer profile)

**File: `src/components/exec-demo/ExecDemoPhoneView.tsx`** (~15 lines changed)

- Accept new `generatedOffers` prop
- When `consumerTab === "rewards"` and offers exist, render a new lightweight `GeneratedOffersPhoneView` instead of `DemoRewardsView`
- This view shows the AI-generated deals as compact cards in the phone mockup (merchant logo placeholder, reward badge, personalized message, CTA button)

**File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`** (~5 lines changed)

- Import `NextOfferRationale`
- When `activeTab === "rewards" && synthesisTriggered`, render `NextOfferRationale` instead of `IntelCardContent`

**File: `src/pages/ExecDemoPage.tsx`** (~25 lines changed)

- Add `generatedOffers` state and ref
- After persona synthesis completes, fire `generate-next-offers` with persona + pillars + demographics + timeline
- Pass `generatedOffers` down to both `ExecDemoIntelPanel` and `ExecDemoPhoneView`
- Update `showContent` condition to also check for offers readiness

**File: `supabase/config.toml`** — add function config block:
```toml
[functions.generate-next-offers]
verify_jwt = false
```

### Data flow
1. Classification completes → persona synthesis fires
2. Persona synthesis completes → `generate-next-offers` fires (uses persona rollups + enriched pillars + customer demographics)
3. Offers arrive → Intel panel shows rationale cards, phone view shows deal cards with personalized messages

Six files total, ~330 lines new code.

