


## Financial Wellness Intelligence — Two-Sided Feature (financial-tip-chat)

### Implemented

**Shared Engine** (`src/lib/wellnessIntelligenceEngine.ts`):
- Tip generator rotating 5 contextual tips based on transactions
- Mock customer insight logs (12 entries) and wellness alerts (10 signals)
- KPI data for banker dashboard

**AI-Powered Coaching Tips** (`supabase/functions/generate-financial-tip/index.ts`):
- Edge function using Lovable AI (gemini-3-flash-preview) to generate contextual tips
- Analyzes real enriched transactions: pillar distribution, merchants, spending tiers, frequencies
- Incorporates customer profile (demographics, holdings, lifestyle type) when available
- Structured output via tool calling returning FinancialTip object
- Strict guardrails: only bank-observable data, no usage metrics or external balances
- Replaces hardcoded tip generation in DemoEngagementView with async call + loading skeleton

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
