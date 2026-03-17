

## Plan: Redesign Customer Experience Preview in Platform Tabs

**Goal**: Replace the current EngagementPreview with a layout that showcases three things: (1) raw categories consolidating into lifestyle pillars with budgeting, (2) a minor gamification section, and (3) a minor coaching section.

### New Layout (2-column grid, same as current)

**Left Column — "Category → Pillar Consolidation"**
- Header: "Transaction Categories → Lifestyle Pillars"
- Show 6-8 raw merchant categories (Restaurants, Coffee Shops, Bars → "Dining" pillar; Gyms, Supplements, Spas → "Wellness" pillar) with visual grouping arrows/lines consolidating into 4 lifestyle pillars
- Each pillar shows aggregated spend and a budget progress bar (reusing the existing near/over/under status badges and colored bars)

**Right Column — "Banking Experience"**  
- Keep the browser chrome mockup frame (yourbank.com/app)
- **Lifestyle Budgeting** (primary): The 2×2 pillar spending grid with progress bars (keep existing design, it's already good)
- **Gamification** (minor): A small "Achievements" card — e.g., "🏆 Dining Streak: 5 weeks under budget" with a subtle progress ring or badge
- **Coaching** (minor): A small "AI Insight" card — e.g., "💡 Your Wellness spending is up 28% — consider adjusting your budget" in a soft blue callout

### Changes

**File: `src/components/PlatformTabs.tsx`** (lines 161-256)
- Rewrite `EngagementPreview` component
- Left side: category-to-pillar consolidation visual with budget bars
- Right side: bank app mockup with budgeting grid, one gamification card, one coaching card
- Remove the current "For You" offers section (that's the Rewards tab's job)
- Remove the "Wellness Explorer" banner (redundant with the pillar view)

No other files need changes.

