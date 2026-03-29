

## Tab-Specific Quick Actions for Ventus AI Chat Panel

### Change
Replace the single `QUICK_ACTIONS` array with a `TAB_QUICK_ACTIONS` map keyed by tab value, so each tab shows contextually relevant prompts.

### File: `src/components/tepilot/insights/VentusAIChatPanel.tsx`

Replace `QUICK_ACTIONS` with:

```ts
const TAB_QUICK_ACTIONS: Record<string, string[]> = {
  dashboard: ["Top spending pillars", "Budget variance alerts", "Pillar growth trends", "Segment spending breakdown"],
  "wallet-share": ["Outflow summary", "Top competitor threats", "Deposit flight trends", "Win-back opportunities"],
  "subscription-analytics": ["Subscription churn risk", "Revenue by subscription tier", "Trending subscriptions", "Cancellation patterns"],
  "rewards-intelligence": ["Seasonal deal opportunities", "Category extension gaps", "Top merchant partnerships", "Timing recommendations"],
  "deal-management": ["Pipeline status overview", "Expiring deals this month", "Top performing deals", "New deal recommendations"],
  "location-experience": ["Top geo-targeted perks", "Underserved regions", "Location engagement rates", "New perk opportunities"],
  gamification: ["Achievement completion rates", "Most popular badges", "Engagement lift from gamification", "New achievement ideas"],
  "life-events": ["Upcoming life event alerts", "Home purchase signals", "Retirement planning signals", "Product recommendations by event"],
  targeting: ["Top cross-sell opportunities", "Segment performance", "Next-best-offer gaps", "Campaign ROI summary"],
  "wm-copilot": ["High-value client risks", "Portfolio rebalancing alerts", "Advisor workload summary", "Client meeting prep"],
  "customer-insights": ["Wellness alert summary", "At-risk customers", "Behavioral stress signals", "Intervention recommendations"],
  "fvi-dashboard": ["Vulnerability cohort overview", "Rising risk segments", "Sensitivity drivers", "Policy impact analysis"],
  "fraud-aml": ["Fraud alert summary", "Suspicious activity trends"],
};
```

Then in the render, replace `QUICK_ACTIONS.map(...)` with:
```ts
(TAB_QUICK_ACTIONS[activeTab] || []).map(...)
```

No other files change.

