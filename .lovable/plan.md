

## Problem

Line 286: `const ctaText = ctaConfig?.text || message?.cta || "Learn More"` — the manual `ctaConfig.text` always wins, so all three tier cards show the same CTA. The AI does return a per-persona `cta` field, but it's overridden.

## Fix

### 1. `PersonalizationPreviewPanel.tsx` — Flip CTA priority

Change line 286 from:
```ts
const ctaText = ctaConfig?.text || message?.cta || "Learn More";
```
to:
```ts
const ctaText = message?.cta || ctaConfig?.text || "Learn More";
```

AI-generated CTA comes first; manual config is fallback only.

### 2. `deal-personalization/index.ts` — Add tier-specific CTA rules to prompt

Add to the existing TIER-AWARE DIFFERENTIATION section:

- **Mass Market**: Simple CTAs — "Get Started", "Open Now", "Start Saving"
- **Affluent**: Growth CTAs — "Maximize Returns", "Optimize Now", "Unlock Growth"
- **HNW**: Premium CTAs — "Schedule Consultation", "Request Access", "Explore Options"

This ensures the AI generates distinct CTAs per tier, not generic "Claim Now" for all three.

### Files Changed

| File | Change |
|------|--------|
| `PersonalizationPreviewPanel.tsx` | Swap CTA priority: AI first, manual fallback |
| `deal-personalization/index.ts` | Add tier-specific CTA guidance to system prompt |

