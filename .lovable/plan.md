

## Plan: 2-Tab Animated Analytics Demo

### Overview
Replace the static "See It In Action" demo with a 2-tab auto-rotating `AnalyticsDemoPanel`. Tab 1 focuses on **insights and trends** (not just raw metrics), Tab 2 on **deep personalization**.

### Tab 1 — "Insights & Trends"
Beyond the current static metrics, this tab tells a story with trend data:

- **Top row**: 4 key metrics with count-up animations AND trend indicators (e.g., "Travel Spend: $78.4B ↑ 18% QoQ", "Active Users: 75M ↑ 3.2%")
- **Trend spotlight section**: 3 animated insight cards that stagger in:
  - "Travel spending surged 18% this quarter — driven by 2.1M users booking international flights, concentrated in 25-44 age group"
  - "Southeast region showing 22% growth in Dining & Entertainment — outpacing national average by 3x"
  - "Millennials (25-34) increasing Financial & Aspirational spend by 31% YoY — largest shift across any demographic"
- **Animated mini bar chart**: Top 5 lifestyle pillars with bars that fill + percentage labels, same as current but with QoQ change arrows (green ↑ / red ↓) next to each
- **AI summary insight** fades in last: a synthesized takeaway tying the trends together

This transforms Tab 1 from "here are numbers" to "here is what your data is telling you" — regional trends, demographic shifts, category momentum.

### Tab 2 — "Deep Personalization"
The generic → personalized transformation:
- **Top**: Single generic product card — "Travel Rewards Card" with bland copy, "One message → 12.3M customers", 0.8% conversion in muted red
- **Center**: Animated transformation divider — "Same product, powered by transaction intelligence"
- **Bottom**: 3 profile cards (Sarah/James/Priya) stagger in with personalized messaging and per-card conversion stats (3.8%-4.3% in green)
- **Footer**: "Personalized messaging drives 3.2x higher conversion vs. generic campaigns"

### Controls & Behavior
- Tab bar: "Insights & Trends" | "Deep Personalization" with underline active state
- Auto-rotates every 8s, pauses on hover
- Replay button resets to Tab 1
- 200ms fade between tabs, fresh mount triggers entry animations

### Files
- **Create** `src/components/analytics/AnalyticsDemoPanel.tsx`
- **Modify** `src/pages/BankWideAnalytics.tsx` — replace inline demo (lines 138-243) with `<AnalyticsDemoPanel />`, remove `demoRef`/`demoVisible`/`pillars`

