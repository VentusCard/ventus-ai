

# Beat 5 Phase 2: Expanded Rolling Product Cards

## What changes
Replace the 4 static labels in Beat 5's connected state with a vertically auto-scrolling carousel of ~12 descriptive product cards sourced from TEPilot and Demo capabilities.

## Card list

1. Smart Rewards with Personalized Offers
2. Life Event Detection & Anticipation
3. AI-Powered Campaign Targeting
4. Behavioral Segment Builder
5. Travel Detection & Local Deals
6. Wealth Copilot for Advisors
7. Personalized Customer Engagement
8. Bank-Wide Behavioral Analytics
9. Automated Relationship Intelligence
10. Financial Wellness Coaching
11. Cross-Sell Opportunity Matrix
12. Geo-Targeted Merchant Partnerships

## Implementation

**File**: `src/components/demo/DemoPasswordGate.tsx` (lines 488–518)

1. Define a 12-item card array with label and icon emoji.
2. Phase 0: keep the current 4 generic static labels as-is.
3. Phase 1: cross-fade (opacity/transform transition) to a fixed-height `overflow-hidden` container (~200px) containing the 12 cards duplicated once (24 total) for seamless looping.
4. Each card: same styling as current items but with blue accent.
5. Animate with CSS `@keyframes scrollUp`: `translateY(0)` → `translateY(-50%)`, ~16s infinite linear.

**File**: `tailwind.config.ts`

Add `scrollUp` keyframe and animation entry under `extend.keyframes` and `extend.animation`.

