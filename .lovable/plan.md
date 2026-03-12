

## Understanding

The user wants the 2-tab animated demo (`AnalyticsDemoPanel`) to replace the **hero section's right-side card** (`HeroAnalyticsCard`) — the dark background first section — not the white "See It In Action" section further down the page.

Currently, the hero (Section 1, dark `#0a0f1e` background) shows `HeroAnalyticsCard` on the right side. The `AnalyticsDemoPanel` was placed in Section 3 ("See It In Action") instead.

## Plan

### Move AnalyticsDemoPanel into the Hero Section

1. **Modify `src/pages/BankWideAnalytics.tsx`**:
   - Replace `<HeroAnalyticsCard />` (line 73) with `<AnalyticsDemoPanel />` in the hero section
   - Remove or repurpose the "See It In Action" section (Section 3) since the demo now lives in the hero
   - Update the "See It Work ↓" button to scroll to the next relevant section (e.g., "The Problem" or capabilities)

2. **Modify `src/components/analytics/AnalyticsDemoPanel.tsx`**:
   - Adapt styling for dark background context — the current panel has a white background with light borders; it needs to switch to dark theme (`#111827` background, `#1e2d4a` borders, white/gray text) to match the hero's `#0a0f1e`
   - Adjust sizing to fit the right column of a 2-column hero grid (currently it's full-width in a single-column section)
   - Remove the intersection observer since the hero is visible on load — trigger animations immediately
   - Ensure tab bar, controls, and all content use dark-themed colors

3. **Remove `HeroAnalyticsCard` import** from the page since it's no longer used.

### Key Styling Changes in AnalyticsDemoPanel
- Container: `bg-[#111827]` with `border-[#1e2d4a]` instead of white/light borders
- Tab bar: dark background with light text, active tab in blue
- Metric cards: dark cards with white values
- Insight cards: dark cards with light text
- Pillar bars: keep colored bars but on dark track
- Personalization tab: dark cards, same transformation flow
- Controls bar: dark theme

