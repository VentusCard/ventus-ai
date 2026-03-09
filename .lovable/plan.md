

## Problem

Currently each automated flow maps to exactly **one** product (e.g., "New Parents" → High-Yield Savings). In reality, different customers within the same life event need different products based on their financial profile. The 3 persona cards should each demonstrate a different product recommendation, not the same one with different wording.

## MECE Segmentation Approach: Income/Wealth Tier

The cleanest MECE split for any life event is **wealth tier** — every customer falls into exactly one:

| Tier | Label | Product Logic (New Parents example) |
|------|-------|-------------------------------------|
| Mass Market | "Building Foundation" | High-Yield Savings |
| Affluent | "Growing Wealth" | 529 Education Plan |
| High Net Worth | "Legacy Planning" | Trust & Estate Services |

This works universally across all life events:

- **Pre-Retirees**: Wealth Suite → Annuity → Estate Transfer
- **Home Buyers**: Mortgage → HELOC → Jumbo Mortgage
- **Education**: Student Loan → 529 Plan → Education Trust

## Changes

### 1. Expand `DEMO_PRODUCTS` in `src/lib/samplePersonaGenerator.ts`
Add missing products: `529_plan`, `trust_services`, `annuity`, `heloc`, `jumbo_mortgage`, `student_loan`, `education_trust`.

### 2. Add `LIFE_EVENT_PRODUCT_TIERS` mapping in `src/lib/samplePersonaGenerator.ts`
A new constant mapping each life event to 3 tier-specific products:
```
family: [
  { tier: "Mass Market", productId: "high_yield_savings", signals: ["Baby product purchases", "Childcare payments"] },
  { tier: "Affluent", productId: "529_plan", signals: ["529 plan contributions", "Education savings research"] },
  { tier: "HNW", productId: "trust_services", signals: ["Estate attorney consultations", "Trust account inquiries"] },
]
```

### 3. Update `generateSamplePersonas` to accept and embed tier info
When in `events` mode, assign each persona a different tier. Add a `tier` label and `recommendedProduct` to the `SyntheticPersona` interface so the preview panel knows which product each persona should receive.

### 4. Update `PersonalizationPreviewPanel` to use per-persona products
Instead of using one `selectedProduct` for all 3 cards, use each persona's `recommendedProduct` when calling the AI edge function. Show the product name as a small badge on each persona card so the viewer understands *why* different people get different messages.

### 5. Update `AutomatedFlowsSection` 
Pass `selectedProduct={null}` and let the per-persona product logic drive the preview. The flow header still shows the "primary" product but the expanded preview demonstrates tier-based personalization.

### 6. Add a tier badge to the persona card UI
Each persona card gets a small subtle badge like "Mass Market", "Affluent", or "HNW" plus the product name, making the MECE logic visible and self-explanatory.

