

# Competitive Intelligence / Wallet Share Analytics — New Tab in Bank-Wide Analytics

## Concept

Add a third tab to `AnalyticsContainer` called **"Wallet Share Intelligence"** that shows where customer money is flowing to competitors — inspired by Revio Insight's approach but differentiated by pairing detection with TEpilot's behavioral context and actionable win-back recommendations.

The key narrative: *Revio tells you money is leaving. Ventus tells you why it's leaving, where it's going, and what to offer to win it back.*

## What Gets Built

### 1. New Tab: "Wallet Share Intelligence"
Added to `AnalyticsContainer.tsx` alongside "Analytics Dashboard" and "Segment Targeting."

### 2. Dashboard Sections (top to bottom)

**A. Headline Metrics Row** (4 cards)
- **Deposit Flight Rate**: % of customers with detected outflows to competitors (e.g., 23.4%)
- **Annual Outflow Volume**: Total estimated $ leaving (e.g., $18.2B)
- **Top Competitor**: Institution capturing most outflows (e.g., Marcus by Goldman Sachs)
- **Win-Back Opportunity**: Estimated recapturable revenue (e.g., $4.1B)

**B. Competitor Outflow Table**
A ranked table of competitor institutions showing:
- Institution name + type (neobank, brokerage, BNPL, etc.)
- Product category (savings, mortgage, credit card, investment)
- Estimated outflow volume
- Affected customer count
- Trend arrow (growing/stable/declining)
- Detection method (ACH pattern, payee name, routing number)

Mock competitors: Marcus, Ally, SoFi, Rocket Mortgage, Wealthfront, Robinhood, Affirm, Apple Card

**C. Outflow by Product Category** (horizontal bar chart)
Categories: High-Yield Savings, Mortgage Refinance, Investment/Brokerage, Credit Cards, BNPL/Lending, Insurance
Shows volume flowing out per category with competitor breakdown.

**D. Win-Back Recommendations** (cards with actions)
Each card pairs a detected outflow pattern with a TEpilot-powered recommendation:
- Outflow pattern detected (e.g., "12,400 customers sending monthly ACH to Marcus")
- Why they're leaving (behavioral context from TEpilot personas — e.g., "Rate-sensitive savers, avg age 34, recent income increase detected")
- Recommended action (e.g., "Launch competitive 4.75% APY savings campaign targeting this segment")
- Estimated recapture amount
- Link concept to Segment Targeting tab

**E. Wallet Share Trend Chart** (line chart over 12 months)
Shows deposit flight trend over time — are outflows accelerating or stabilizing?

### 3. Files to Create/Edit

| File | Action |
|------|--------|
| `src/types/bankwide.ts` | Add `CompetitorOutflow`, `WalletShareMetrics`, `WinBackRecommendation` interfaces |
| `src/lib/mockBankwideData.ts` | Add mock data functions for wallet share analytics |
| `src/components/tepilot/insights/WalletShareView.tsx` | New — main container component |
| `src/components/tepilot/insights/WalletShareMetrics.tsx` | New — headline metric cards |
| `src/components/tepilot/insights/CompetitorOutflowTable.tsx` | New — ranked competitor table |
| `src/components/tepilot/insights/OutflowByCategoryChart.tsx` | New — horizontal bar chart (recharts) |
| `src/components/tepilot/insights/WinBackRecommendations.tsx` | New — actionable recommendation cards |
| `src/components/tepilot/insights/WalletShareTrendChart.tsx` | New — 12-month trend line chart |
| `src/components/tepilot/insights/AnalyticsContainer.tsx` | Edit — add third "Wallet Share" tab |

### 4. Differentiator Messaging

The intro banner for this tab will emphasize the Ventus advantage over pure competitive-intel tools:

> *"Other platforms detect where money is leaving. Ventus AI tells you why — connecting outflow patterns to customer personas, life events, and behavioral signals to power precision win-back campaigns."*

All mock data uses realistic institution names and product categories to make the demo compelling for conference attendees.

