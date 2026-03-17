

## Plan: Side-by-Side Achievement + Coaching Cards with Financial Wellbeing Content

### Changes

**File: `src/components/PlatformTabs.tsx`** (lines 208-239)

Put the achievement and coaching cards in a `grid grid-cols-2 gap-1.5` row and update content:

1. **Achievement card** (left half) — "Savings Streak": "12 weeks of saving $50+", progress bar 12/16, amber gradient, Trophy icon, "Saver Pro" badge
2. **Coaching card** (right half) — "Emergency Fund": "You're 68% to your 3-month safety net. Auto-save $25/week to hit it by August.", Lightbulb icon, green "On Track" badge, "Adjust" / "Keep going" buttons

Both cards keep existing styling (amber/blue gradients, border, rounded-lg) but are more compact to fit half-width. Reduce text sizes slightly where needed.

