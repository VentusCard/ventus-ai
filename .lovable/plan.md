

## Problem

Looking at the network requests, all three tier personas send nearly identical context to the AI. For example, Pre-Retirees sends:
- Mass Market: `traits: ["Retirement Planning", "Building Foundation"]`, signals: `["401k rollover activity", "Retirement community research"]`
- Affluent: `traits: ["Retirement Planning", "Growing Wealth"]`, signals: `["Annuity product research", "Fixed income investment activity"]`
- HNW: `traits: ["Retirement Planning", "Legacy Planning"]`, signals: `["Estate attorney payments", "Large gift transfers"]`

The signals differ, but the `deal-personalization` edge function prompt doesn't know about wealth tiers, so it generates generic "Secure your future..." messages for all three. The AI has no instruction to differentiate tone/angle by tier.

## Fix: Pass tier context and update the prompt

### 1. `PersonalizationPreviewPanel.tsx` - Include tier in the AI call context

Add `persona.tier` to the `ctx` object sent to the edge function:
```
ctx: {
  demo: { occ: ..., fam: ..., tier: persona.tier || null },
  ...
}
```

### 2. `deal-personalization/index.ts` - Update system prompt to differentiate by tier

Add tier-aware instructions to the system prompt:

- **Mass Market**: Emphasize accessibility, simplicity, getting started, practical benefits
- **Affluent**: Emphasize growth, optimization, maximizing returns, strategic advantages  
- **HNW**: Emphasize exclusivity, legacy, white-glove service, sophisticated planning

Add examples:
| Tier | Product | Message Style |
|------|---------|--------------|
| Mass Market | High-Yield Savings | "Start building your baby's future with a simple, high-yield savings account" |
| Affluent | 529 Plan | "Maximize your education savings with tax-advantaged 529 contributions" |
| HNW | Trust Services | "Protect your family's legacy with personalized trust and estate planning" |

### Files Changed

| File | Change |
|------|--------|
| `src/components/tepilot/campaigns/PersonalizationPreviewPanel.tsx` | Add `tier` field to `ctx.demo` |
| `supabase/functions/deal-personalization/index.ts` | Add tier-aware differentiation rules to the system prompt |

