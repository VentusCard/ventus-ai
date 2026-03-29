

## Add Subscription Analytics Tab to Bank-Wide Analytics

### Overview
Add a new "Subscription Analytics" tab under the Analytics sidebar group. This view lets bank leaders see trends and analysis of top subscriptions across the customer base — monthly volume, growth trends, category breakdowns, and churn signals.

### Changes

**1. New component: `src/components/tepilot/insights/SubscriptionAnalyticsView.tsx`**

A dashboard with mock data containing:
- **Summary metric cards** — Total subscription spend, avg subscriptions per customer, MoM growth, churn rate
- **Top Subscriptions table** — Ranked list of top 20 subscriptions (Netflix, Spotify, Amazon Prime, etc.) with subscriber count, total monthly volume, MoM trend, avg tenure
- **Category breakdown chart** — Pie/bar chart grouping subscriptions into categories (Streaming, Fitness, News, Software, Food Delivery, etc.) using Recharts
- **Monthly trend chart** — Line chart showing total subscription spend over 12 months with overlaid new vs. churned subscriber counts
- **Subscription churn signals** — Cards highlighting subscriptions with highest recent cancellation rates, paired with behavioral context (e.g., "Disney+ cancellations spike 40% after free-trial cohort from Q3")

All powered by static mock data, consistent with the rest of the analytics suite.

**2. New mock data: `src/lib/mockSubscriptionData.ts`**

Static data generators for:
- Top subscriptions list with merchant name, category, subscriber count, monthly volume, MoM change, avg tenure months
- Category aggregations
- 12-month trend data
- Churn signal entries

**3. Update `src/components/tepilot/insights/AnalyticsContainer.tsx`**

- Add `'subscription-analytics'` to `TabValue` union
- Add nav item under the "Analytics" group: `{ value: "subscription-analytics", label: "Subscription Analytics", icon: CreditCard }` (using `CreditCard` or `Repeat` from lucide)
- Add case in `renderContent()` switch

### Technical details
- Uses Recharts (already in the project) for charts
- Follows the same patterns as WalletShareView and BankwideView
- No database changes needed — all mock data

