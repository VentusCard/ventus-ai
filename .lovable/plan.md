

## Financial Wellness Intelligence — Two-Sided Feature (financial-tip-chat)

### Implemented

**Shared Engine** (`src/lib/wellnessIntelligenceEngine.ts`):
- Tip generator rotating 5 contextual tips based on transactions
- Mock customer insight logs (12 entries) and wellness alerts (10 signals)
- KPI data for banker dashboard

**Side A — Customer: FinancialTipCard** (`src/components/tepilot/insights/FinancialTipCard.tsx`):
- Single financial tip card displayed side-by-side with Financial Achievements (2-col grid)
- Two preset responses: "Got it, I'll do that" / "I don't have enough funds"
- Opens chat dialog powered by advisor-chat edge function with financial-tip-chat mode
- Response logged indicator shown after interaction

**Side B — Banker: WellnessAlertsDashboard** (`src/components/tepilot/insights/WellnessAlertsDashboard.tsx`):
- New "Customer Insights" tab in AnalyticsContainer
- Two-sided loop visualization diagram
- 4 KPI cards (Tips Delivered, Response Rate, Need Help Signals, Engagement Score)
- Customer Tip Responses table with sentiment, takeaways, and banker actions
- Financial Wellness Signals table with severity, status management, recommended actions
- Configurable alert thresholds (severity cutoff, auto-coaching toggle, min deposit)

### Layout Changes
- `TePilot.tsx`: FinancialAchievements + FinancialTipCard in `grid-cols-1 lg:grid-cols-2`
- `AnalyticsContainer.tsx`: Added "Customer Insights" tab with Heart icon
